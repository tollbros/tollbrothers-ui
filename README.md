# tollbrothers-ui package

## How was this package created?
1. Created the `tollbrothers-ui` project on Github as an empty repo for the `tollbros` Github org.
2. Locally created a `packages` directory.
3. Checked out the `tollbrothers-ui` repo in the `packages` directory.
4. Within the `packages/tollbrothers-ui` directory, run `npm init --scope=tollbrothers` and chose all the defaults.
5. Run `npx create-react-library tollbrothers-ui` in the directory and modify the `package.json` file in the created directory to include what's in the root directory.
6. Move all files from created directory into the root.
7. Run `npm install next` and `npm install sass` to add NextJS and SASS to the project.
8. Change `dependencies` to `peerDependencies` in the `package.json` file.

## How was this package tested locally?
1. Within the `packages/tollbrothers-ui` directory, run `npm link`. This created the `package-lock.json` file.
2. Went back to the `packages` directory and run `npx create-next-app tollbrothers-ui-test`
3. Within the `packages/tollbrothers-ui-test` directory, run `npm link @tollbrothers/tollbrothers-ui`. This linked the `tollbrothers-ui` package to the test script.
4. Add `import '@tollbrothers/tollbrothers-ui/dist/index.css` in `packages/tollbrothers-ui-test/pages/_app.js`.
5. Add `import { HeroComponent } from '@tollbrothers/tollbrothers-ui'` in `packages/tollbrothers-ui-test/pages/index.js`.
6. Create a `heroSlides` array of objects that contain an `image`, `title`, and `URL` parameter for each slide.
7. Add `<HeroComponent>` to return statement and pass in `slides={heroSlides}` and `darkness={true or false}` to component. It will resize to fit whatever container it is in.
8. Verify that the component shows on the page via `npm run dev`.

## How do we publish changes?
1. Publishing has been automated by the Semantic Release Workflow

## Semantic Release Workflow
Basically, follow the commit message format below. Then when the commit is posted on the `main` branch semantic-release will do its thing and publish a new version on `merge to main` or a direct commit to `main`.
* [Commit message format](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#type)
* [How does it work?](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#type)

## Things to consider
- You can publish code without commiting it. Not sure why you would but there are no guards to prevent you from doing so.
- On github, the org is `tollbros`
- On npm, the org is `tollbrothers`