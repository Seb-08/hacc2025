##Notes
- This our HACC-issued repo
  - If you would like to see the history of our app, please check the docs folder.
- Link to our repo: https://github.com/Seb-08/hacc2025
  - This repo is where we developed our app
  - Our vercel is connected to this repo
- Link to deployed app: https://hacc2025.vercel.app
- Also just as a notice, we integrated an AI summarizer into our web app but have limited # of clicks per day. Please be mindful of the # of times you click on a report - thank you!
  
##Setup instructions
1. Clone github repo using VS code
2. Run pnpm install in terminal first.
3. If libraries are erroring out, here are all the libraries to be installed:
- pnpm install @engagespot/react-component
- pnpm install @engagespot/node
- pnpm add react-to-print
4. If you are still having errors try these:
- Make sure your node.js is up to date
- Download the live server extension
- src>styles>global css>line 2>@plugin “daisyui”;
5. Or try these commands:
- pnpm add -D daisyui@latest
- pnpm install tailwindcss
- pnpm add uploadthing
- pnpm add @uploadthing/react
- Invoke-WebRequest https://get.pnpm.io/install.ps1 -UseBasicParsing | Invoke-Expression
5. If you are still having issues, try open and reopen vs code
6. Create an .env file in the folder that you cloned the repo to. We will dm you the env files on slack


# Create T3 App

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## What's next? How do I make an app with this?

We try to keep this project as simple as possible, so you can start with just the scaffolding we set up for you, and add additional things later when they become necessary.

If you are not familiar with the different technologies used in this project, please refer to the respective docs. If you still are in the wind, please join our [Discord](https://t3.gg/discord) and ask for help.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Drizzle](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.


