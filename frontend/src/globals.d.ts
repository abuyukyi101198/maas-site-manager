declare namespace globalThis {
  // This *has* to be a var, otherwise it will not be included in the global scope - based on maas-ui
  // eslint-disable-next-line no-var
  var __ROOT_PATH__: string;
}
