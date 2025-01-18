import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { sign } from 'hono/jwt';
import { z } from 'zod';

export const userRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
    }
}>();

const signupBody = z.object({
    email: z.string().email(),
    name: z.string(),
    password: z.string().min(8),
    role: z.enum(['User', 'Manager', 'Admin'])
});

userRouter.post('/signup', async (c) => {
    const body = await c.req.json();
    const parsedBody = signupBody.safeParse(body);
    if (!parsedBody.success) {
        c.status(400);
        return c.json({
            message: "Inputs not correct"
        });
    }
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const existingUser = await prisma.user.findFirst({
        where: {
            email: body.email,
        }
    });
    if (existingUser) {
        c.status(400);
        return c.json({
            message: 'You already have an account'
        });
    }

    try {
        const user = await prisma.user.create({
            data: {
                email: body.email,
                password: body.password,
                name: body.name,
                role: body.role
            }
        });
        const jwt = await sign({
            id: user.id,
            role: user.role
        }, c.env.JWT_SECRET);

        return c.json({
            token: jwt,
            message: "Signup successfully"
        });
    } catch (e) {
        console.log(e);
        c.status(500);
        return c.json({
            message: "Internal Server Error"
        });
    }
});

const signinBody = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

userRouter.post('/signin', async (c) => {
    const body = await c.req.json();
    const parsedBody = signinBody.safeParse(body);
    if (!parsedBody.success) {
        c.status(400);
        return c.json({
            message: "Inputs not correct"
        });
    }

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
        const user = await prisma.user.findFirst({
            where: {
                email: body.email,
                password: body.password,
            }
        });
        if (!user) {
            c.status(403);
            return c.json({
                message: "Invalid credentials"
            });
        }
        const jwt = await sign({
            id: user.id,
            role: user.role
        }, c.env.JWT_SECRET);

        return c.json({
            token: jwt,
            message: 'Signin successfully'
        });
    } catch (e) {
        console.log(e);
        c.status(500);
        return c.json({
            message: 'Internal Server Error'
        });
    }
});