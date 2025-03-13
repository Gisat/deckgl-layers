# Geoimage NPM Folder
As this app is focused on NPM development with NextJS rendering demos, `/geoimage` is the NPM content that will be exported as final product of this repository.

Here is good place for:
- Anything for final NPM

We should avoid any platform dependencies like Next, test frameworks or similar.

## Diferences from Next App
- Styles: Please use exact CSS class names like `<Component className="some.class />` not `<Component className={styles.CoolClass} />`
- All NPM Dependency mus be in `package.json` in this (`geoimage`) folder
- NPM folder must have own `tsconfig.json`
- NPM folder must have own `.gitignore`