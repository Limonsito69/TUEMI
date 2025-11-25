import Image from "next/image";
import Link from "next/link";
import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";


export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#EEF1FF]">
      {/* NAVBAR - CORREGIDO */}
      <nav className="w-full bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <Image
                src="/img/logo_1.png"
                width={48}
                height={48}
                alt="Logo TUEMI"
                // CLASE CORREGIDA: Eliminado "rounded-md"
                />
                <span className="text-xl font-bold text-[#0F1E7A]">
                Sistema T.U.E.M.I.
                </span>
            </div>

            <div className="flex gap-6 text-[#0F1E7A] font-semibold">
                <a href="#sobre" className="hover:text-[#1B2BA5]">
                Sobre el sistema
                </a>
                <a href="#caracteristicas" className="hover:text-[#1B2BA5]">
                Características
                </a>
                <a href="#contacto" className="hover:text-[#1B2BA5]">
                Contacto
                </a>
                <Link
                href="/login"
                className="px-4 py-2 bg-[#0F1E7A] text-white rounded-md hover:bg-[#1B2BA5]"
                >
                Iniciar Sesión
                </Link>
            </div>
            </div>
        </nav>

        {/* HERO - CORREGIDO */}
        <section className="flex flex-col lg:flex-row items-center justify-between px-8 lg:px-20 py-20">
            <div className="max-w-xl">
            <h1 className="text-4xl font-bold text-[#0F1E7A]">
                Optimiza el transporte universitario con TUEMI
            </h1>
            <p className="text-lg text-gray-700 mt-4">
                Plataforma inteligente diseñada para gestionar, monitorear y
                mejorar la eficiencia del transporte en la EMI.
            </p>
            <Link
                href="/login"
                className="mt-6 inline-block px-6 py-3 bg-[#0F1E7A] text-white rounded-md text-lg hover:bg-[#1B2BA5]"
            >
                Acceder al Sistema
            </Link>
            </div>

            <div className="mt-10 lg:mt-0">
            <Image
                src="/img/logo_1.png"
                width={350}
                height={350}
                alt="TUEMI principal"
                // CLASES CORREGIDAS: Eliminado "rounded-xl shadow-lg"
            />
            </div>
        </section>

        {/* SOBRE */}
        <section id="sobre" className="bg-white py-20 px-8 lg:px-20">
            <h2 className="text-3xl font-bold text-[#0F1E7A] text-center">
            ¿Qué es TUEMI?
            </h2>
            <p className="max-w-3xl mx-auto mt-6 text-gray-700 text-lg text-center">
            TUEMI es un sistema integral desarrollado para mejorar el desempeño del
            transporte universitario en la Escuela Militar de Ingeniería, 
            facilitando el control de rutas, monitoreo en tiempo real y análisis
            inteligente de datos.
            </p>
        </section>

        {/* CARACTERÍSTICAS */}
        <section
            id="caracteristicas"
            className="py-20 px-8 lg:px-20 bg-[#EEF1FF]"
        >
            <h2 className="text-3xl font-bold text-[#0F1E7A] text-center">
            Características principales
            </h2>

            <div className="grid md:grid-cols-3 gap-10 mt-10 max-w-6xl mx-auto">
            <div className="p-6 bg-white shadow-md rounded-xl">
                <h3 className="text-xl font-semibold text-[#0F1E7A]">
                Monitoreo en tiempo real
                </h3>
                <p className="mt-2 text-gray-600">
                Observa la ubicación de buses, su estado y alertas al instante.
                </p>
            </div>

            <div className="p-6 bg-white shadow-md rounded-xl">
                <h3 className="text-xl font-semibold text-[#0F1E7A]">
                Gestión de rutas y usuarios
                </h3>
                <p className="mt-2 text-gray-600">
                Administra conductores, estudiantes y rutas con facilidad.
                </p>
            </div>

            <div className="p-6 bg-white shadow-md rounded-xl">
                <h3 className="text-xl font-semibold text-[#0F1E7A]">
                Reportes automáticos
                </h3>
                <p className="mt-2 text-gray-600">
                Accede a reportes completos para mejorar la toma de decisiones.
                </p>
            </div>
            </div>
        </section>

        {/* CONTACTO + FOOTER - CORREGIDO */}
        <footer className="bg-[#0F1E7A] text-white pt-16 pb-8 mt-auto"
            id="contacto">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-10">

            {/* Información */}
            <div>
            <h3 className="text-xl font-semibold">Contáctanos</h3>
            <p className="mt-4 text-gray-200">
                Si deseas más información o tienes alguna consulta, puedes comunicarte
                con nosotros en cualquier momento.
            </p>

            <div className="mt-4 space-y-2 text-gray-300">
                <p><strong>Email 1:</strong> soporte@tuemi.com</p>
                <p><strong>Email 2:</strong> contacto@tuemi.com</p>
                <p><strong>Celular 1:</strong> +591 70000000</p>
                <p><strong>Celular 2:</strong> +591 78888888</p>
            </div>
            </div>

            {/* Redes sociales */}
            <div>
                <h3 className="text-xl font-semibold">Síguenos</h3>
                <p className="mt-4 text-gray-200">Estamos presentes en diversas plataformas.</p>

                <div className="flex flex-col mt-4 gap-4 text-gray-300">

                    <a 
                    href="#" 
                    className="flex items-center gap-3 hover:text-white transition"
                    >
                    <FaFacebook size={24} />
                    Facebook — TUEMI Oficial
                    </a>

                    <a 
                    href="#" 
                    className="flex items-center gap-3 hover:text-white transition"
                    >
                    <FaInstagram size={24} />
                    Instagram — @tuemi_oficial
                    </a>

                    <a 
                    href="#" 
                    className="flex items-center gap-3 hover:text-white transition"
                    >
                    <FaWhatsapp size={24} />
                    WhatsApp — Línea TUEMI
                    </a>

                </div>
            </div>

            {/* Logo + Sobre la empresa - CORREGIDO */}
            <div className="flex flex-col items-start">
            <Image
                src="/img/logo_1.png"
                width={80}
                height={80}
                alt="Logo TUEMI"
                // CLASES CORREGIDAS: Eliminado "rounded-lg object-cover shadow-md"
            />

            <p className="mt-4 text-gray-300 text-sm">
                Sistema T.U.E.M.I.<br />
                Plataforma de monitoreo y gestión del transporte universitario EMI.
            </p>
            </div>
        </div>

        {/* Línea final */}
        <div className="text-center text-gray-300 text-sm mt-12 border-t border-gray-600 pt-6">
            © {new Date().getFullYear()} TUEMI — Sistema de Transporte Universitario EMI<br />
            Desarrollado por el equipo de Ingeniería de Sistemas.
        </div>
        </footer>

    </div>
  );
}