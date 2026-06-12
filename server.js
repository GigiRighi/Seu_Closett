require('dotenv').config(); // <-- Adicione isso na primeira linha do arquivo
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();

// Aumenta o limite de tamanho para aceitar as fotos em Base64
app.use(express.json({ limit: '50mb' }));
app.use(cors());

// CONFIGURAÇÃO DO BANCO NEON (Protegido por variáveis de ambiente)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// ROTA 1: Salvar nova roupa no banco
app.post('/api/roupas', async (req, res) => {
    const { nome_roupa, id_categoria, id_usuario, imagem_roupa } = req.body;
    
    try {
        const query = `
            INSERT INTO public.roupas (nome_roupa, id_categoria, id_usuario, imagem_roupa) 
            VALUES ($1, $2, $3, $4) RETURNING *;
        `;
        const values = [nome_roupa, id_categoria, id_usuario, imagem_roupa];
        const resultado = await pool.query(query, values);
        
        res.status(201).json({ success: true, item: resultado.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Erro ao salvar roupa no banco.' });
    }
});

// ROTA 2: Salvar look combinado no banco
app.post('/api/looks', async (req, res) => {
    const { id_usuario, nome_look, ocasiao } = req.body;
    
    try {
        const query = `
            INSERT INTO public.look (id_usuario, nome_look, ocasiao) 
            VALUES ($1, $2, $3) RETURNING *;
        `;
        const values = [id_usuario, nome_look, ocasiao];
        const resultado = await pool.query(query, values);
        
        res.status(201).json({ success: true, look: resultado.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Erro ao salvar look no banco.' });
    }
});

/// Procure a linha do app.listen no final do arquivo e mude para:
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});