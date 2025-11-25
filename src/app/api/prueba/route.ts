import { NextResponse } from 'next/server';
import { quickQuery } from '@/lib/db'; // Importamos tu función de consulta

// La función GET responde a las peticiones HTTP GET a /api/prueba
export async function GET() {
    try {
        // ⚠️ Importante: Reemplaza 'SYSOBJECTS' por el nombre de una tabla real que tengas.
        // 'SYSOBJECTS' es una tabla de sistema común en MSSQL y a veces sirve para probar.
        const sqlQuery = "SELECT TOP 5 name, xtype FROM tuemi_db WHERE xtype='U'";

        // Ejecuta la consulta usando tu función de Pool de Conexiones
        const result = await quickQuery(sqlQuery);

        // Si la consulta es exitosa, devolvemos la data.
        return NextResponse.json({
            message: "✅ Conexión a MSSQL exitosa. Datos de prueba:",
            data: result.recordset
        });

    } catch (error) {
        console.error('❌ Error en la Ruta API /api/prueba:', error);
        // Si hay un error, devolvemos un estado 500 (Internal Server Error)
        return NextResponse.json(
            {
                message: "❌ Error de conexión o consulta a la base de datos. Revisa la consola del servidor para detalles.",
                error: (error as Error).message // Opcional: mostrar un error general
            },
            { status: 500 }
        );
    }
}