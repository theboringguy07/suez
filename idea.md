# Suez: CLI Open-Source Contributor Toolkit

Suez is a CLI application designed to eliminate the "what should I work on?" paralysis for open-source contributors. It filters a user's starred repositories, recommends relevant issues, and automates the boilerplate of claiming and setting up a local environment.

## 1. Configuration & Setup

* **`suez init` (Wizard):** A one-time setup command that authenticates the user via GitHub Bearer Token and walks them through setting up their default preferences (languages, clone paths, branch formats).
* **`suez config` (Management):** * `suez config open`: Opens the `suezconfig.json` file in the user's default `$EDITOR` for manual tweaks.
  * `suez config set <key> <value>`: Quickly updates specific settings from the terminal.
* **`suezconfig.json`:** The core configuration file storing:
  * Authentication token.
  * Custom repository lists (e.g., categorizing starred repos into "frontend", "cli-tools").
  * Global language filters.
  * Default "Work in Progress" (WIP) comment template.
  * Git automation preferences (auto-fork, base clone directory, branch naming conventions).

## 2. Issue Discovery & Recommendations

* **Curated Browsing:** Users search for issues strictly within their custom lists, cutting out the noise of repositories starred purely for bookmarking.
* **Smart Contextual Recommendations:** Suggests issues based on labels the user has historically interacted with in recent PRs or raised issues.
* **Granular Filtering:** * **Language Filter:** Automatically hides issues in languages the user doesn't know.
  * **"Good First Issue" Mode:** A strict filter flag (e.g., `suez suggest --beginner`) to only show beginner-friendly issues.
  * **Size/Effort Surfacing:** The CLI UI displays time estimation/size labels (e.g., `size: small`) if used by maintainers.
* **The "Mute" Action:** Users can permanently hide specific issues they have no interest in working on.

## 3. The "Take Issue" Workflow

* **Anti-Hoarding Guardrail:** Restricts users to only one active WIP issue per repository at a time.
* **Automated (Optional) Commenting:** * When claiming an issue, Suez prompts: *"Take this issue? (Sends WIP comment to GitHub)"*.
  * **Live Editing:** Before sending, the user is asked if they want to edit the default comment. If yes, Suez opens their terminal's default text editor (`vim`, `nano`, `code`), allowing them to add context-specific details without altering their global config template.
* **Direct PR Linking / Local Automation:** * Automatically sets up the local Git environment based on config preferences.
  * Checks if the repo exists locally. If not, it can automatically fork the repo via the GitHub API, clone it to the designated `base_directory`, and add the original as an `upstream` remote.
  * Automatically creates and checks out a cleanly named branch (e.g., `fix/issue-142`).

## 4. Tracking & State Management

* **Dashboard View:** Users can run a status command (e.g., `suez status`) to view a clean UI of their active WIPs and completed issues.
* **Local State Storage:** Active issues are tracked locally (e.g., in a `wip.json` file or SQLite database) to keep CLI performance fast without spamming the GitHub API.
* **Smart Auto-Syncing:** Background polling periodically checks the GitHub API. If a WIP issue is merged or closed by a maintainer, Suez automatically moves it to the "Completed/Archived" state locally.
* **Manual Override:** Users can manually mark an issue as completed, or drop it back into the pool if they abandon it.z
