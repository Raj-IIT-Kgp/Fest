import { Hono, Context, Next } from 'hono';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { verify } from "hono/jwt";

type User = {
    id: string;
    role: string;
};

export const eventRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
    },
    Variables: {
        userId: string;
        user: User;
    }
}>();

eventRouter.use("/*", async (c, next) => {
    const authHeader = c.req.header("Authorization") || "";

    try {
        const user = await verify(authHeader, c.env.JWT_SECRET) as User;
        if (user) {
            c.set("user", user);
            c.set("userId", user.id);
            await next();
        } else {
            c.status(403);
            return c.json({
                message: "You are not logged in"
            });
        }
    } catch (e) {
        c.status(403);
        return c.json({
            message: "You are not logged in"
        });
    }
});

const roleMiddleware = (roles: string[]) => {
    return async (c: Context, next: Next) => {
        const user = c.get('user') as User;
        if (!user || !roles.includes(user.role)) {
            c.status(403);
            return c.json({ message: 'Forbidden' });
        }
        await next();
    };
};

const eventSchema = z.object({
    title: z.string(),
    description: z.string(),
    date: z.string().default(() => new Date().toISOString()).refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid date format',
    }),
});

eventRouter.post('/create', roleMiddleware(['Manager', 'Admin']), async (c: Context) => {
    const body = await c.req.json();
    const parsedBody = eventSchema.safeParse(body);
    if (!parsedBody.success) {
        c.status(400);
        return c.json({ message: 'Invalid input', errors: parsedBody.error.errors });
    }

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
        const userId = parseInt(c.get("userId"), 10);
        if (isNaN(userId)) {
            throw new Error('Invalid user ID');
        }

        const event = await prisma.event.create({
            data: {
                title: body.title,
                description: body.description,
                date: new Date(body.date),
                createdById: userId,
            },
        });
        return c.json({ event, message: 'Event created successfully' });
    } catch (error) {
        console.error('Error creating event:', error);
        c.status(500);
        return c.json({ message: 'Internal Server Error', error: error});
    }
});

eventRouter.get('/all', async (c: Context) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    try {
        const events = await prisma.event.findMany();
        return c.json({ events });
    } catch (error) {
        console.log(error);
        c.status(500);
        return c.json({ message: 'Internal Server Error' });
    }
});

eventRouter.delete('/:id', roleMiddleware(['Admin']), async (c: Context) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const eventId = c.req.param('id');
    try {
        await prisma.event.delete({
            where: { id: parseInt(eventId) },
        });
        return c.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.log(error);
        c.status(500);
        return c.json({ message: 'Internal Server Error' });
    }
});

eventRouter.post('/enroll/:id', async (c: Context) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const eventId = parseInt(c.req.param('id'));
    const user = c.get('user') as User;

    try {
        const enrollment = await prisma.enrollment.create({
            data: {
                userId: parseInt(user.id, 10),
                eventId: eventId,
            },
        });
        return c.json({ enrollment, message: 'Enrolled successfully' });
    } catch (error) {
        console.log(error);
        c.status(500);
        return c.json({ message: 'Internal Server Error' });
    }
});

eventRouter.delete('/deenroll/:eventId/:userId', roleMiddleware(['Admin']), async (c: Context) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const eventId = parseInt(c.req.param('eventId'));
    const userId = parseInt(c.req.param('userId'));

    try {
        await prisma.enrollment.delete({
            where: {
                userId_eventId: {
                    userId: userId,
                    eventId: eventId,
                },
            },
        });
        return c.json({ message: 'Deenrolled successfully' });
    } catch (error) {
        console.log(error);
        c.status(500);
        return c.json({ message: 'Internal Server Error' });
    }
});

export default eventRouter;