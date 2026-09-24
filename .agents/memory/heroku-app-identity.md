---
name: Heroku app identity
description: Distinguishing a Heroku public hostname from the name used by Git and the Platform API
---

The suffix-bearing public herokuapp.com hostname is not necessarily the app name accepted by Heroku Git or the Platform API. Do not derive a Git remote from the hostname alone.

**Why:** A remote built from the full public hostname returned not-found responses even with valid authorization; querying the accessible apps revealed a shorter canonical app name whose metadata pointed to that public URL.

**How to apply:** Before changing or using a Heroku remote, check the authenticated app metadata and confirm its `web_url` matches the intended public endpoint. Use the confirmed app name in the Git remote, and do not force-push.