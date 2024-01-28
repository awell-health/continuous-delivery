# Platform

This repository is an example of using google's firebase to create or update a release in slack when a release's status changes. It requires a slack app with various permissions:

OAuth permissions:

- chat:write
- chat:write.public
- channels:read
- channels:join
- users:read (for auth)
- usergroups: read (for auth)

Events must also be enabled, and the app must subscribe to the `app_home_opened` event.

If there are other settings missing, please let me know by [sending me an email](mailto:jonathan@awellhealth.com). I created this repository after the fact by copying some code over and modifying / simplifying a few features to make it easier to get started.

## Cold starts

This particular setup experiences cold starts, meaning it takes 3-5 seconds in slack to respond to a button click, so I would recommend doing a more traditional server deployment if having a faster UX in slack is important to you and your team.
