# Commit message instructions

Use the Conventional Commits format:

```
<type>: <subject>
```

## Type

One of:

- `feat` — new functionality or user-visible change
- `fix` — bug fix
- `refactor` — code change without behavior change
- `test` — adding or updating tests
- `docs` — README and other documentation
- `chore` — dependencies, package-lock, version bumps, CI workflows, configs
- `style` — formatting only
- `perf` — performance improvement

## Subject

- English, imperative mood: "add", "fix", "remove" — not "added" or "adds"
- Lowercase first letter, no trailing period
- Max 72 characters
- Describe what changed from the user's or developer's point of view, not which files were touched
- One commit — one idea. If the changes are unrelated, describe the main one

## Body

- Omit it always

## Examples

```
feat: add mock filters
fix: correct dark mode styles in expanded mock card
refactor: remove unused getStatusCodeColor import
test: add unit tests for header and profile
chore: update version to 1.15.0 in manifest.json
```

Do not use emojis, scopes in parentheses, or issue references unless explicitly asked.
