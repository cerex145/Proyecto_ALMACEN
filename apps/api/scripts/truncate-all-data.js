#!/usr/bin/env node

/**
 * Script para vaciar todas las tablas de la base de datos
 * Preserva la estructura (tablas y columnas)
 * 
 * Uso: node truncate-all-data.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { AppDataSource } = require('../src/config/database');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function confirmar() {
    return new Promise((resolve) => {
        rl.question(
            '\n⚠️  ADVERTENCIA: Esto eliminará TODOS los datos de todas las tablas.\n' +
            '   Las tablas y columnas se preservarán.\n' +
            '   ¿Deseas continuar? (sí/no): ',
            (answer) => {
                resolve(answer.toLowerCase() === 'sí' || answer.toLowerCase() === 'si');
            }
        );
    });
}

async function truncarTodas() {
    let queryRunner = null;

    try {
        await AppDataSource.initialize();
        queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();

        console.log('\n📋 Conectado a la base de datos...');

        const ok = await confirmar();
        if (!ok) {
            console.log('\n❌ Operación cancelada.');
            rl.close();
            process.exit(0);
        }

        console.log('\n🗑️  Limpiando todas las tablas...\n');

        // Desactivar constraints temporalmente
        await queryRunner.query('SET CONSTRAINTS ALL DEFERRED');

        const tablas = [
            'roles',
            'usuarios',
            'clientes',
            'productos',
            'ajustes',
            'lotes',
            'notas_ingreso',
            'nota_ingreso_detalles',
            'notas_salida',
            'nota_salida_detalles',
            'actas_recepcion',
            'acta_recepcion_detalles',
            'alertas',
            'kardex',
            'logs'
        ];

        for (const tabla of tablas) {
            try {
                await queryRunner.query(`TRUNCATE TABLE ${tabla} RESTART IDENTITY CASCADE`);
                console.log(`  ✅ ${tabla}`);
            } catch (error) {
                // Si la tabla no existe, solo avisa
                console.log(`  ⏭️  ${tabla} (no existe)`);
            }
        }

        // Reactivar constraints
        await queryRunner.query('SET CONSTRAINTS ALL IMMEDIATE');

        console.log('\n✅ Base de datos limpiada exitosamente.');
        console.log('   Todas las tablas están vacías, estructura preservada.\n');

        rl.close();
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Error al limpiar la BD:', error.message);
        rl.close();
        process.exit(1);
    } finally {
        if (queryRunner) {
            await queryRunner.release();
        }
    }
}

truncarTodas();
