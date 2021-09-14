const express = require('express');
const app = express();

const PORT = 8800;
const HOST = "0.0.0.0";

const path = require('path');
var bodyParser = require('body-parser');

const { FileSystemWallet, Gateway } = require('fabric-network');
const fs = require('fs')
const ccpPath = path.resolve(__dirname, '..', '..', 'basic-network', 'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);
const wallPath = path.join(process.cwd(), 'wallet');  // cwd : current working directory
const wallet = new FileSystemWallet(wallPath);

app.use(express.static(path.join(__dirname, 'views')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.get('/', async function(req, res){
// 잔액 조회 (블록체인과 연동)

    const id = req.query.id;
    const userExists = await wallet.exists('user1');

    if (!userExists){
        console.log('An identity for the user "user1" does not exist in the wallet');
        console.log('Run the registerUser.js application before retrying');
        return;
    }

    // user1에 접근하는 3단계 과정
    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity:'user1', discovery : {enabled:false} });
    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('myfirstcc');

    const result = await contract.evaluateTransaction("get", id);

    res.status(200).send(result);    
});

app.post('/', async function(req, res){
// 잔액 저장 (블록체인과 연동)
    const id = req.query.id;
    const setdata = req.body.setdata;
    
    if (!userExists){
        console.log('An identity for the user "user1" does not exist in the wallet');
        console.log('Run the registerUser.js application before retrying');
        return;
    }

    // user1에 접근하는 3단계 과정
    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity:'user1', discovery : {enabled:false} });
    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('myfirstcc');

    const result = await contract.evaluateTransaction("set", id, setdata);

    res.status(200).send(result);    
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);