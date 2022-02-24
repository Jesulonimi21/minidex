import React, { useState } from 'react';
import {Button,Typography,CircularProgress,LinearProgress} from '@material-ui/core';
import {Grid} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import algosdk from 'algosdk';
import MyAlgoConnect from '@randlabs/myalgo-connect';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { Buffer } from 'buffer';
import {replicantApAppIds, replicantApAssetIds, replicantArtistAddresses, compileStatelessProgram} from '../utils/utils';


function ApSales(){











// let program = new Uint8Array(Buffer.from(epochBase64Address,"base64"))
// const lsig = algosdk.makeLogicSig(program);   
// let [addresses, setAddresses] =useState([]);
let addresses =[];
let myalgoconnect = new MyAlgoConnect();
const token = { 'X-API-Key':'ADRySlL0NK5trzqZGAE3q1xxIqlQdSfk1nbHxTNe'};
const server = "https://mainnet-algorand.api.purestake.io/ps2";
const baseServer = "https://mainnet-algorand.api.purestake.io/idx2";
const port = '';
const client = new algosdk.Algodv2(token, server, port);
let indexerClient = new algosdk.Indexer(token, baseServer, port);

    const classes = useStyles();
    return(
        <div className={classes.root}>
            <Grid container spacing={3} >
           

                {replicantApAssetIds.map((el, index) => ArtistComp(index))}
            
                
            </Grid>
        </div>
    );

    async function connectToWallet(){
        return new Promise(async(resolve,reject)=>{
            let addresses;
            try{
                addresses = await myalgoconnect.connect();
                resolve(addresses)
            }catch(error){
                reject(error);
            }       
        });
     
    }
    async function isConnected(){
        return new Promise(async(resolve,reject)=>{
            if(addresses.length==0){
                try{
                   let addr =  await connectToWallet()
                   addresses= addr;
                   console.log(addr);
                   resolve(true);
                }catch(error){
                 console.error(error);
                  reject(false);    
                } 
             }else{
                  resolve(true);
             }
        })
       
    }




    async function sendEdition1(index, setP1Loading, setD1Visible, setD1Title, setD1Text){
        setP1Loading(true);
        let boolVal = await isConnected();
        if(!boolVal){
            setP1Loading(false);
            return;
        }
        console.log(addresses);
        const assetId = replicantApAssetIds[index];
        const appId = replicantApAppIds[index];

        let results = {};
        try{
            results = await compileStatelessProgram(client, assetId, appId);
        }catch(e){
            console.error(e);
            setD1Title("An Error occurred")
            setD1Text(JSON.stringify(e));
            setD1Visible(true);
            setP1Loading(false)
        }
        
    
        const base64Hash = results.result;
        const program = new Uint8Array(Buffer.from(base64Hash,"base64"))
        const lsig = algosdk.makeLogicSig(program);   
        const clawback = results.hash;
        const artistAddress = replicantArtistAddresses[index].address
        let params = {};
        try{
            params = await client.getTransactionParams().do();
        }catch(e){
            console.error(e);
        }
        //TODO: change peter's address
        let assetSendTxn = sendAsset(assetId,addresses[0].address,artistAddress,1,client,params,  clawback, base64Hash );
        let appCallTxn =  makeApplicationCallTransaction(addresses[0].address,appId,[new TextEncoder().encode("sell_nft")],params);

        let txns = [assetSendTxn,appCallTxn];
        let groupId = algosdk.computeGroupID(txns);
        txns = txns.map((el)=>{
            el.group=groupId;
            return el;
        });
        console.log(results);
        let signedTxns = {};
        try{
            signedTxns =  await myalgoconnect.signTransaction([txns[1]]);
        }catch(error){
            console.error("Error ocurred ", error);
            // alert(error)
            setD1Title("An Error occurred")
            setD1Text(JSON.stringify(error));
            setD1Visible(true);
            setP1Loading(false)
        }

        let blobs = signedTxns.map((el,index)=>{
            return el.blob
        });
        let signedTxn0 = algosdk.signLogicSigTransaction(txns[0], lsig);
        let signedTest = [signedTxn0.blob,...blobs];
        console.log(signedTest)
        let txTest={};
        try{
            txTest=(await client.sendRawTransaction(signedTest).do());
            setP1Loading(false);
            if(txTest.txId!=null&&txTest.txId!=undefined){
                setD1Title("Success");
                setD1Text(`Transaction id: ${txTest.txId}`);
            }
        }catch(error){
            console.error("Error ocurred ", error);
                    // alert(error)
                    setD1Title("An Error occurred")
                    setD1Text(JSON.stringify(error));
                    setD1Visible(true);
                    setP1Loading(false)
                    return;
            }




        //     setP1Loading(true);
        //     let boolVal = await isConnected();
        //     if(!boolVal){
        //         setP1Loading(false);
        //         return;
        //     }
        //     console.log(addresses);
        
        //     let params = await client.getTransactionParams().do();
        //     let appCallTxn =  makeApplicationCallTransaction(addresses[0].address,applicationId,[],params, "clawback adddr", "epoc");
        //     let zeroSendTxn = sendFunds(addresses[0].address,neilBerloufa[1],0,params);
        //     let assetSendTxn = sendAsset(assetIds[0],addresses[0].address,neilBerloufa[1],1,client,params);

        //     console.log(appCallTxn);
        //     console.log(zeroSendTxn);
        //     console.log(assetSendTxn);

        //     let txns = [assetSendTxn,zeroSendTxn,appCallTxn];
        //     let groupId = algosdk.computeGroupID(txns);
        //             txns = txns.map((el)=>{
        //             el.group=groupId;
        //             return el;
        //             });

        // let signedTxn0 = algosdk.signLogicSigTransaction(txns[0], lsig)
        // let signedTxns ={};
        // try{
        //     signedTxns =  await myalgoconnect.signTransaction([txns[1], txns[2]]);
        // }catch(error){
        //     console.error("Error ocurred ", error);
        //     // alert(error)
        //     setD1Title("An Error occurred")
        //     setD1Text(JSON.stringify(error));
        //     setD1Visible(true);
        //     setP1Loading(false)
        // }
    
        // let blobs = signedTxns.map((el,index)=>{
        //     return el.blob
        // })

        // let signedTest = [signedTxn0.blob,...blobs];
        // console.log(signedTest)
        // let txTest={};
        // try{
        //     txTest=(await client.sendRawTransaction(signedTest).do());
        //     setP1Loading(false);
        //     if(txTest.txId!=null&&txTest.txId!=undefined){
        //         setD1Title("Success");
        //         setD1Text(`Transaction id: ${txTest.txId}`);
        //     }
        //   }catch(error){
        //     console.error("Error ocurred ", error);
        //             // alert(error)
        //             setD1Title("An Error occurred")
        //             setD1Text(JSON.stringify(error));
        //             setD1Visible(true);
        //             setP1Loading(false)
        //             return;
        //     }
    }


    function ArtistComp(index){
        let[P1Loading,setP1Loading] = useState(false);
        let[D1Visible,setD1Visible] = useState(false);
        let[D1Text,setD1Text] = useState("D1 Text");
        let[D1Title,setD1Title]= useState("D1 Title");
let handleCloseD1=()=>{
    setD1Visible(false)
}
        return (
        <Grid item xs ={4}>
    <Paper  elevation={3} className={classes.paper}>
    <Dialog
                open={D1Visible}
                onClose={handleCloseD1}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description">

                <DialogTitle id="alert-dialog-title">{D1Title}</DialogTitle>
                <DialogContent>
                <DialogContentText id="alert-dialog-description">{D1Text}</DialogContentText>
                </DialogContent>
                <DialogActions>
                <Button onClick={handleCloseD1} color="primary">
                    Cancel
                </Button>
                <Button onClick={handleCloseD1} color="primary" autoFocus>
                    Ok
                </Button>
                </DialogActions>
            </Dialog>

        {P1Loading? <CircularProgress color="primary" className={classes.progress}/>:null}
    {P1Loading? <CircularProgress color="primary" className={classes.progress}/>:null}
    <Typography className={classes.typohraphy}>Name: {replicantArtistAddresses[index].name} </Typography>
        <div className={classes.horDiv}>
        <Typography variant="subtitle1" className={classes.typohraphy}>Address: </Typography>
        <Typography variant="subtitle1" className={classes.typohraphy} style={{ wordWrap: "break-word",width:"480px" }}>{replicantArtistAddresses[index].address}</Typography>
        </div>
        <Typography className={classes.typohraphy}>Edition: Epoch Replicants Ap {`${index + 1}/${replicantApAssetIds.length}`}</Typography>

        {/* <Typography variant="subtitle1" className={classes.typohraphy}>Received : true</Typography> */}
        <div className={classes.buttonDiv}>
            <Button variant ="contained" color = "primary" onClick={() => {sendEdition1(index, setP1Loading, setD1Visible, setD1Title, setD1Text)}}>Send Replicant Ap edition {index + 1}</Button>
        </div>
    </Paper>
    </Grid>

    )
    }

    function makeApplicationCallTransaction(sender,appId,appArgs,params){
        let txn = {
            type: "appl",
            appOnComplete: 0,
            from: sender,
            appIndex: appId,
            fee: 1000,
            flatFee: true,
            ...params,
            note: new Uint8Array(Buffer.from('Replicant – NFT", 2001')),
            appArgs
    };
        return txn;
    }

    function sendFunds(sender,receiver,amount,params){
        let    txn = {
              ...params,
              fee: 1000,
              flatFee: true,
              type: 'pay',
              from: sender,
              to:  receiver,
              amount: amount,
              note: new Uint8Array(Buffer.from('“FREEPORT” – featuring Neïl Beloufa, Sarah Rosalena Brady, Alice Bucknell, Juan Covelli, Alexandra Koumantaki, Amanda Ross-Ho, Hirad Sab", 2001'))
      };
       
          return txn;
      }

      function sendAsset(assetID,revocationTarget,recipient, units,algodClient,params, epochClawedBackAddress, epochBase64Address){   

       let closeRemainderTo = undefined;
        //Amount of the asset to transfer
       let  amount = units;

        // signing and sending "txn" will send "amount" assets from "sender" to "recipient"
        let xtxn = algosdk.makeAssetTransferTxnWithSuggestedParams(epochClawedBackAddress, recipient, closeRemainderTo, revocationTarget,
                amount,  new Uint8Array(Buffer.from("FREEPORT” – featuring Neïl Beloufa, Sarah Rosalena Brady, Alice Bucknell, Juan Covelli, Alexandra Koumantaki, Amanda Ross-Ho, Hirad Sab")), assetID, params);
        let program = new Uint8Array(Buffer.from(epochBase64Address,"base64"))
        const lsig = algosdk.makeLogicSig(program);   
       console.log(lsig.address());
        // let rawSignedTxn = algosdk.signLogicSigTransactionObject(xtxn, lsig)
        return xtxn;
    }
    
}
const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
      marginTop:20,
      marginLeft:15,
      marginRight:15
    },
    paper: {
      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
      height:300,
      display:"flex",
      flexDirection:"column",
      alignItems:'flex-start',
      position:'relative'
    },
    typohraphy:{
        fontSize:"1",
        color:"#000",
        textAlign:'start',
        marginTop:"15px"
    },
    horDiv:{
        display:'flex',
        flexDirection:'row',
        justifyContent:'center'
    },
    buttonDiv:{
        // border:"solid 2px #000",
        width: "100%",
        marginTop:"20px"
    },
    progress:{
        display:'flex',
        position:'absolute',
        top:"50%",
        left:'50%'

    }
  }));
export default ApSales;
