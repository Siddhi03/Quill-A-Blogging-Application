import { Hono } from 'hono'
import {PrismaClient} from "@prisma/client/edge"
import { withAccelerate } from '@prisma/extension-accelerate'
import { decode, sign, verify } from 'hono/jwt'

const app = new Hono<{
  Bindings: {
    DATABASE_URL : string;
    JWT_SECRET : string;
  }
}>()

app.post('/api/v1/user/signup', async(c) =>{

  const body = await c.req.json();
  const prisma = new PrismaClient({
    datasourceUrl:c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  try{
    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: body.password,
        name: body.name
      }
    })

    const jwt = await sign({
      id: user.id
    }, c.env.JWT_SECRET);

    return c.text(jwt);

  } catch(e){
    c.status(411);
    return c.text("Invalid")
  }
  

})

app.post('/api/v1/user/signin', async(c) =>{
  const body = await c.req.json();
  const prisma = new PrismaClient({
    datasourceUrl:c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  try{
    const user = await prisma.user.findFirst({
      where: {
        email: body.email,
        password: body.password,
      }
    })

    if(!user){
      c.status(403);
      return c.json({
        message: "Invalid credentials"
      })
    }

    const jwt = await sign({
      id: user.id
    }, c.env.JWT_SECRET);

    return c.text(jwt);
    
  } catch(e){
    c.status(411);
    return c.text("Invalid")
  }
  return c.text('signin route created')
})

app.post('/api/v1/blog', (c) =>{
  return c.text('write blog')
})

app.put('/api/v1/blog', (c)=>{
  return c.text("update blog")
})

app.get('/api/v1/blog', (c)=>{
  const id = c.req.param('id');
  console.log(id);
  return c.text('get blog route')
})

app.get('/api/v1/blog/bulk', (c)=>{
  return c.text("hhhh")
})


export default app
