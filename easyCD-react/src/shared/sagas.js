export function createSagaAction (type){
  return {
    REQUEST: `${ type }.REQUEST`,
    SUCCESS: `${ type }.SUCCESS`,
    FAILURE: `${ type }.FAILURE`
  };
}