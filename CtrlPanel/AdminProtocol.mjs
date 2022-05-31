
//A specification for the dual protocols we use between client and server
import DPTransceiver, {tID, Protocol, DataInterpreter} from "./../Protocol.mjs"

//Protocols for sending of each (other receives using that protocol)
let srvsend = new Protocol([2, tID.uint8]); //ModuleID, EffectCode
let adminsend = new Protocol([1, tID.uint8]); //

function GetTransceiver(cnxn, recv, send) {
   return new DPTransceiver(cnxn, recv, new DataInterpreter(send));
};

//All of these semantic protocol modules generally come in Client/Server pairs of this form:
export let ServerTransceiver = (cnxn => GetTransceiver(cnxn, adminsend, srvsend));
export let AdminTransceiver = (cnxn => GetTransceiver(cnxn, srvsend, adminsend));

