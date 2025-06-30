const http = require('http');
const fs = require("fs");
const path = require("path");

const port = 3000;
const data  = fs.readFileSync(`index.html`, 'utf-8');
const server = http.createServer((req,res) => {
    if(req.url === '/'){
        // const filePath = path.join(__dirname,'index.html');
        // fs.readFileSync(filePath, (err,data) => {
        //     if(err) {
        //         res.writeHead(500);
        //         return res.end('Error');
        //     }
        //     res.writeHead(200,{'Content-Type' : 'text/html'});
        //     console.log("served")
        //     return res.end(data);

       res.writeHead(200,{'Content-Type' : 'text/html'});
        res.end(data)
        };
})

server.listen(port,'127.0.0.1', () => {
    console.log(`listening in ${port}`)
})