# plugins/ — packaging deliverable (Track A, deliverable 6)

CAPSTONE.md requires the whole workflow — recurring-tasks implementation
support, tests, CI, and the sub-agent review team — packaged as an
installable plugin. This directory is a placeholder, not a scaffold: there
is no starter plugin structure here for you to fill in, because the
packaging decisions (what ships as a command vs. an agent vs. a skill) are
part of the deliverable.

## Reference, don't copy

This repo already has a worked example of a TaskFlow plugin's directory
shape: `day6/plugins/taskflow-kit/`. Look at:

- `day6/plugins/taskflow-kit/plugin.json` — the plugin manifest shape
  (`name`, `version`, `description`, and pointers to `commands`, `skills`,
  `agents` subdirectories).
- `day6/plugins/taskflow-kit/agents/`, `commands/`, `skills/` — how each
  category of asset is laid out under the plugin root.

Use it as a structural reference for the directory shape and manifest
fields — not as content to copy in. Your plugin's actual commands, agents,
and skill(s) need to reflect what your team built for the recurrence
feature and its CI/review workflow, not what's in that example.

## What "installs cleanly" means (stretch goal)

CAPSTONE.md's Track A stretch goal is the plugin installing cleanly into a
second, unrelated repository with its commands still working. If you
attempt the stretch, verify that by actually doing it — clone or scaffold
a throwaway second repo and install the plugin into it — not by inspection
alone.
