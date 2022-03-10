const express = require("express");
const {v4:uuidv4} = require("uuid");

const app = express();
 
app.use(express.json());

const customers = [];


/** 
 * 
 * 
 * cpf - string
 * name - string
 * id - uuid - identifacor unico universal para gera é nercessario instalar a biblioteca uuid
 * statement []
 * 
 * 
*/

//Middleware

function verifyIfExistsAccountCPF(request,response,next){
  const {cpf} = request.headers;


  const customer = customers.find((customer )=> customer.cpf === cpf);
  
  if(!customer){
    return response.status(400).json({
      erro:"customer not found"
    })
  }

  request.customer = customer;
  return  next();
}

function getBalance(statement){
  const balance = statement.reduce((acc,operation)=>{
    if(operation.type ==="cradit"){
      return acc + operation.amount;
    }else{
      return acc + operation.amount;
    }
  },0)

  return balance;
}

app.post("/account", (request,response)=>{
  const {cpf, name} = request.body;

  const customerAlreadyExiste = customers.some(
    (customers) => customers.cpf === cpf
  );

  if(customerAlreadyExiste){
    return response.status(400).json({error: "Customer already Existe!"})
  }
   
  customers.push({
    cpf,
    name,
    id: uuidv4(),
    statement: [],
  
  });
  return response.status(201).send();
});

//app.use(verifyIfExistsAccountCPF);

app.get("/statement",verifyIfExistsAccountCPF,(request,response)=>{
  
// const {cpf} = request.params;
//   const {cpf} = request.headers;
//   const customer = customers.find((customer )=> customer.cpf === cpf);
//  if(!customer){
//    return response.status(400).json({
//      erro:"customer not found"
//    })
//  }

  const {customer} = request;
  return response.json(customer.statement);
})


app.post("/deposit",verifyIfExistsAccountCPF,(request,response) =>{
  const {description, amount} = request.body;
  
  const {customer} = request;

  const statementOperetion = {
    description,
    amount,
    created_at: new Date(),
    type:"credit"
  }

  customer.statement.push(statementOperetion);
  return response.status(201).send();
})

app.post("/withdraw",verifyIfExistsAccountCPF,(request,response)=>{
  const {amount} = request.body;
  const {customer} = request;

  const balance = getBalance(customer.statement);

  if(balance < amount){
    return response.status(400).json({èrror:"Insuficiente Funds"})
  }

  const statementOperetion = {
    amount,
    created_at: new Date(),
    type:"debit"
  }
  customer.statement.push(statementOperetion);
  return response.status(201).send();
  
})

app.get("/statement/date", verifyIfExistsAccountCPF,(request,response)=>{
  const {customer} = request;
  const {date} = request.query;

  const dateFormat = new Date(date + " 00:00");
  
  const statement = customer.statement.filter((statement)=>statement.created_at.toDateString() === new Date (dateFormat).toDateString())

  return response.json(customer.statement);

});

app.put("/account",verifyIfExistsAccountCPF, (request,response)=>{
  const {name} = request.body;
  const {customer} =  request; 

  customer.name = name;

  return response.status(201).send();

});

app.get("/account", verifyIfExistsAccountCPF,(request,response)=>{
  const {customer} = request;

  return response.json(customer)
})

app.delete("/account",verifyIfExistsAccountCPF,(request,response)=>{
  const {customer} = request;

  //splice
  customers.splice(customer,1)

  return response.status(200).json(customer)
})

app.get("/balance",verifyIfExistsAccountCPF,(request,response)=>{
  const {customer} = request;

  const balance = getBalance(customer.statement);

  return response.json(balance);

})
app.listen(3333);