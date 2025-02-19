
import logo from './logo.svg';
import './App.css';
import React  from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import MenuIcon from '@material-ui/icons/Menu';
import Button from '@material-ui/core/Button';
import Drawer from '@material-ui/core/Drawer';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import List from '@material-ui/core/List';
import HomeIcon from '@material-ui/icons/Home';
import CartIcon from '@material-ui/icons/ShoppingCart';
import ApSales from './screens/ApSales';
import ReplicantNftCreation from './screens/ReplicantNftCreation';
import ManageReplicantNft from './screens/ManageReplicantNft';
import ManageEchoesNft from './screens/ManageEchoesNft';
import Home from './screens/Home';
import WalletConnect from "@walletconnect/client";
import QRCodeModal from "algorand-walletconnect-qrcode-modal";
import { formatJsonRpcRequest } from "@json-rpc-tools/utils";
import {BrowserRouter as Router,Switch,Route, useHistory} from 'react-router-dom';
import ReplicantApSales from './screens/ReplicantApSales';

function App(props) {

  const classes = useStyles();
  let history = useHistory();
  const [state, setState] = React.useState({
    top: false,
    left: false,
    bottom: false,
    right: false,
  });
 
  const [pageTitle, setPageTitle]= React.useState('Epoch Nfts');
  const toggleDrawer = (anchor, open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setState({ ...state, [anchor]: open });
  };
  let connector = new WalletConnect({
    bridge: "https://bridge.walletconnect.org", // Required
    qrcodeModal: QRCodeModal,
  });
  const [account, setAccount] = React.useState( connector.connected ? connector.accounts[0]: null);

  const list = (anchor)=>{
    return(<div className={classes.list}
            role = "presentation"
            onClick={toggleDrawer(anchor,false)}
            onKeyDown={toggleDrawer(anchor,false)}>
              
              <List>
                  <ListItem button key = "Epoch Home"
                    onClick={(event)=>{setPageTitle("Epoch Home"); history.push("/")}}>
                    <ListItemIcon>
                      <HomeIcon />
                      <ListItemText primary={"Epoch Home"} />
                    </ListItemIcon>
                  </ListItem>
                  <ListItem button key = "Replicant AP Sales"
                  onClick={(event)=>{
                    setPageTitle("Replicant AP Sales"); 
                    history.push("/apsales")
                  }}>
                  <ListItemIcon>
                      <CartIcon />
                      <ListItemText primary={"Replicant AP Sales"} />
                    </ListItemIcon>
                  </ListItem>
              </List>
           </div>)
  }
  

  return (
    
      <div className={classes.root}>
          <AppBar position="static">
            <Toolbar>
              <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu"
              onClick={(event)=>{setState({...state,left:true})}}>
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" className={classes.title}>
                {pageTitle}
              </Typography>
              <Button onClick = {() => {
                    
                connector = new WalletConnect({
                  bridge: "https://bridge.walletconnect.org", // Required
                  qrcodeModal: QRCodeModal,
                });
                   
                 if( account != null){
                      connector.killSession();
                      setAccount(null);
                      return;
                  }
                  console.log(connector);
                  // connector.killSession();
                  // Check if connection is already established
                    if (!connector.connected) {
                        console.log("not connected");
                        // create new session
                        connector.createSession();
                    }
                    if(connector.connected){
                      console.log("connector is connected");
                      setAccount(connector.accounts[0]);
                    }
                    connector.on('connect', (error, payload) => {
                      console.log(payload.params[0].accounts[0]);
                      setAccount(payload.params[0].accounts[0])
                    });

                    connector.on("session_update", (error, payload) => {
                      if (error) {
                        throw error;
                      }
                    console.log("session_update");
                      // Get updated accounts 
                      const { accounts } = payload.params[0];
                      setAccount(payload.params[0].accounts[0])
                    });
                    
                    connector.on("disconnect", (error, payload) => {
                      console.log("Disconnected");
                      if (error) {
                        throw error;
                      } });
              }} color="inherit"> { account == null ? 'Connect': "Disconnect" }</Button>
            </Toolbar>
          </AppBar>
          <Drawer anchor={"left"} open={state.left} onClose={toggleDrawer("left", false)}>
          {list("left")}
        </Drawer>
    
        <Switch>
            <Route path = "/replicant-creation">
             {() =>  {
              setPageTitle('Replicant Nft Creation');
           return (<ReplicantNftCreation/>)
             }}
            </Route>

            <Route path = "/replicant-manage">
             {() =>  {
              setPageTitle('Manage Replicant Nft');
           return (<ManageReplicantNft/>)
             }}
            </Route>

            <Route path = "/apsales">
              <ApSales/>
            </Route>
            
            <Route path="/manage-echoes">
              <ManageEchoesNft sender = {account} />
            </Route>
            <Route path="/replicant-apsales">
              <ReplicantApSales sender = {account} />
            </Route>
            <Route path = "/">
              <Home/>
            </Route>
        </Switch>

      </div>
 
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  list: {
    width: 250,
  },
  fullList: {
    width: 'auto',
  },
}));




export default App;
