# Plugin maintenance

For contributors maintaining the plugin. Customer installation is documented on
[Start](https://screenrig.ai/docs/start/).

`skills/screenrig/`, `build/plugin.json` and marketplace manifests are canonical.
`scripts/build-plugin.py` generates `plugins/screenrig/`; never edit that output
independently. Locally the builder packs sibling `../cli`; CI packs current CLI
main. `components.lock.json` records the resulting artifact's commit and hash,
not a commit to refetch.

Read [AGENTS.md](https://github.com/screenrig/plugin/blob/main/AGENTS.md) for generation and verification commands. Operational
skill text belongs in the entrypoint and task references; implementation details
belong here. The source and generated skill must travel with the same CLI bundle.

Skill validation checks command availability, references, launcher/version flow,
error handling and secret boundaries. It does not require marketing sentences.
