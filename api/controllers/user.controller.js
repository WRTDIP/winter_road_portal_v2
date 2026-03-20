import { genUUID } from '../lib/utils.js';
import { prisma } from '../lib/prisma.js';

export const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteUser = async (req, res) => {
    const { id } = req.params; 

    try {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) return res.status(404).json({ message: 'User not found' }); 
        await prisma.user.delete({ where: { id } });
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { email, name } = req.body;  

    try {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) return res.status(404).json({ message: 'User not found' });
        const updated = await prisma.user.update({
            where: { id },
            data: { email, name }
        });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }   
};

export const createUser = async (req, res) => {
    const { email, name, password } = req;
    try {
        const user = await prisma.user.create({
            data: { id: genUUID(), email, name, password }
        });
        res.status(201).json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};