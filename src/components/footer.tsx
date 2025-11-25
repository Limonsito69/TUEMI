import { Facebook, Instagram, Twitter, Mail, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-8 mt-auto">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Columna 1: Identidad */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-blue-400">T.U.E.M.I.</h3>
          <p className="text-sm text-slate-300">
            Sistema de Transporte Universitario Inteligente de la Escuela Militar de Ingeniería.
            Seguridad y eficiencia en cada viaje.
          </p>
        </div>

        {/* Columna 2: Enlaces Rápidos */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold">Enlaces</h3>
          <ul className="text-sm space-y-2 text-slate-300">
            <li><a href="#" className="hover:text-white transition">Términos y Condiciones</a></li>
            <li><a href="#" className="hover:text-white transition">Política de Privacidad</a></li>
            <li><a href="#" className="hover:text-white transition">Soporte Técnico</a></li>
          </ul>
        </div>

        {/* Columna 3: Contacto y Redes */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold">Contacto</h3>
          <div className="flex items-center gap-2 text-sm text-slate-300">
             <Phone className="w-4 h-4" /> <span>800-10-5555</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
             <Mail className="w-4 h-4" /> <span>transporte@emi.edu.bo</span>
          </div>
          
          {/* Redes Sociales */}
          <div className="flex gap-4 mt-4">
            <a href="#" className="hover:text-blue-400 transition"><Facebook className="w-5 h-5"/></a>
            <a href="#" className="hover:text-pink-400 transition"><Instagram className="w-5 h-5"/></a>
            <a href="#" className="hover:text-blue-300 transition"><Twitter className="w-5 h-5"/></a>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800 mt-8 pt-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Escuela Militar de Ingeniería. Todos los derechos reservados.
      </div>
    </footer>
  );
}