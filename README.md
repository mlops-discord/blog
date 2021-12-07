# Blog

This is source code for our site mlops-discord.github.io
You can use it to edit markdown files, then update the site at https://github.com/mlops-discord/mlops-discord.github.io



## Usage

The `main` branch is our source of truth. Only content in main should be on the site.

### For local development

1. Clone this repo
```bash
git clone git@github.com:mlops-discord/blog.git
```
2. Move into the directory `blog`
```bash
cd blog
```
3. Install dependencies
```bash
npm install
```
4. Build the site
```bash
npm run build
```
5. Serve the site locally
```bash
npm run serve
```

### Deploy site

Once a change has been merged back to main (and only then), run
```bash
npm run deploy
```
>Note that this requires access to the site repo, so leave deployment to the site admins


### More instructions

Follow instructions [here](https://github.com/konstantinmuenster/gatsby-theme-portfolio-minimal/tree/main/gatsby-theme-portfolio-minimal#using-the-blog-integration-feature) to set up for local development / deploy to production!


## Contributing Guide

If you have any suggestions, take a look at the issues page, or any PR's that might be tackling the issues already. If it's not, please feel free to open an issue and contribute code to the project.
