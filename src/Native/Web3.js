// elm-web3 native module
// Warning: Here be dragons. Modify this file carefully.
// This file handles the core interaction with web3.js

var _cmditch$elm_web3$Native_Web3 = function() {

    var web3Errors = {
      nullResponse: "Web3 responded with null. Check your parameters. Non-existent address, or unmined block perhaps?",
      undefinedResposnse: "Web3 responded with undefined."
    };

    //TODO: Test to see if this even works -- set blocknumber super high on getBlock and try it on the mainnet
    function handleNullorUndefinedResponse(callback, r) {
        if (r === null) {
            return callback(_elm_lang$core$Native_Scheduler.fail(
                { ctor: 'Error', _0: web3Errors.nullResponse }
            ));
        } else if (r === undefined) {
            return callback(_elm_lang$core$Native_Scheduler.fail(
                { ctor: 'Error', _0: web3Errors.undefinedResposnse }
            ));
        }
    };


    function toTask(request) {
        console.log(request);
        return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {
            try {
                var f = eval("web3." + request.func);
                f.apply(null,
                    // Args passed from elm are always appended with an Error-First style callback,
                    // in order to satisfy web3's aysnchronus by design nature.
                    request.args.concat( (e, r) =>  {
                        // Map response errors to error type
                        handleNullorUndefinedResponse(callback, r);
                        // Decode the payload using Elm function passed to Expect
                        var result = request.expect.responseToResult( formatResponse(r) );
                        console.log(result);
                        if (result.ctor !== 'Ok') {
                            // resolve with decoding error
                            return callback(_elm_lang$core$Native_Scheduler.fail(
                                {ctor: 'BadPayload', _0: result._0}
                            ));
                        }
                        // success
                        return callback(_elm_lang$core$Native_Scheduler.succeed(result._0));
                    })
                );
            } catch (e) {
                console.log(e);
                return callback(_elm_lang$core$Native_Scheduler.fail({ ctor: 'Error', _0: e.toString() }));
            }
        });
    };


    function deployContract(deployFunc){
        // console.log(deployFunc);
        return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {
            try {
                var contract = eval("web3." + deployFunc);
                console.log(contract);
                var address = (contract.address == null || contract.address == undefined) ? "not mined" : contract.address
                return callback(_elm_lang$core$Native_Scheduler.succeed(
                    { ctor: "_Tuple2", _0: contract.transactionHash, _1: address }
                ));
            }
            catch (e) {
                console.log(e);
                return callback(_elm_lang$core$Native_Scheduler.fail({ ctor: 'Error', _0: e.toString() }));
            }
        });
    };


    //TODO Implement event watching and event stopping.
    function eventsHandler(){

    };


    function expectStringResponse(responseToResult) {
        return {
            responseToResult: responseToResult
        };
    };


    function formatResponse(r) {
      switch (true) {
        case r.isBigNumber :
          try { r = r.toFixed() } catch(e) {};
        case r.totalDifficulty !== undefined :
          try { r.totalDifficulty = r.totalDifficulty.toFixed() } catch(e) {};
        case r.difficulty !== undefined :
          try { r.difficulty = r.difficulty.toFixed() } catch(e) {};
        case r.value !== undefined :
          try { r.value = r.value.toFixed() } catch(e) {};
        case r.gasPrice !== undefined :
          try { r.gasPrice = r.gasPrice.toFixed() } catch(e) {};
        default:
          return JSON.stringify(r);
      }
    }


    return {
        toTask: toTask,
        deployContract: deployContract,
        expectStringResponse: expectStringResponse
    };

}();
