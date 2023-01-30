export default (context, inject) => {
    // works:
    console.log(`foo: ${context.$config.foo}`);
    inject('getFoo', () => { console.log(`getFoo: ${context.$config.foo}`)} )
    // doesn't work:
    //function bar() {
    //    console.log(`bar: ${ctx.$config.siteName}`);
    //}
}