#!/usr/bin/env python3
"""Check the reviewed CLI dependency boundary without mutating the bundle."""

import copy
import importlib.util
import unittest
from pathlib import Path
from unittest.mock import patch


spec = importlib.util.spec_from_file_location(
    "public_checker", Path(__file__).with_name("check-public-repo.py")
)
checker = importlib.util.module_from_spec(spec)
spec.loader.exec_module(checker)


class DependencyBoundaryTests(unittest.TestCase):
    def check_with(self, mutation=None):
        original_load = checker.load

        def load(path, errors):
            value = copy.deepcopy(original_load(path, errors))
            if mutation:
                mutation(path, value)
            return value

        errors = []
        with patch.object(checker, "load", load):
            checker.check_metadata(errors)
        return errors

    def change_dependencies(self, change):
        def mutation(path, value):
            if path == checker.BUNDLE / "cli" / "package.json":
                change(value)
        return self.check_with(mutation)

    def test_reviewed_artifact_dependencies_pass(self):
        self.assertEqual(self.check_with(), [])

    def test_extra_dependency_rejected(self):
        errors = self.change_dependencies(
            lambda value: value["dependencies"].update({"unexpected-package": "1.0.0"})
        )
        self.assertTrue(any("extra ['unexpected-package']" in error for error in errors))

    def test_missing_dependency_rejected(self):
        errors = self.change_dependencies(lambda value: value["dependencies"].pop("ajv"))
        self.assertTrue(any("missing ['ajv']" in error for error in errors))

    def test_malformed_dependencies_rejected(self):
        errors = self.change_dependencies(lambda value: value.update(dependencies=[]))
        self.assertTrue(any("dependencies must be an object" in error for error in errors))

    def test_runtime_pin_mismatch_still_rejected(self):
        def mutation(path, value):
            if path == checker.BUNDLE / "cli" / "runtime-dependencies.lock.json":
                value["packages"][0]["version"] = "0.0.0-invalid"
        errors = self.check_with(mutation)
        self.assertTrue(any("dependency differs from its manifest" in error for error in errors))

    def test_missing_runtime_package_still_rejected(self):
        def mutation(path, value):
            if path == checker.BUNDLE / "cli" / "runtime-dependencies.lock.json":
                value["packages"] = [item for item in value["packages"] if item["name"] != "ajv"]
        errors = self.check_with(mutation)
        self.assertTrue(any("missing a declared production dependency" in error for error in errors))


if __name__ == "__main__":
    unittest.main()
