export default (ctx) => {
    // works:
    console.log(`foo: ${ctx.$config.siteName}`);
    // doesn't work:
    //function bar() {
    //    console.log(`bar: ${ctx.$config.siteName}`);
    //}
}