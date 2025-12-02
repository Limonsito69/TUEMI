import { PublicHeader } from "@/components/public-header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MapPin, Clock, ShieldCheck, Phone, Mail, Map as MapIcon } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      
      <main className="flex-1">
        {/* --- SECCIÓN HERO (Principal) --- */}
        <section id="inicio" className="relative bg-[#1A237E] text-white py-12 sm:py-16 md:py-20 lg:py-32 overflow-hidden">
          {/* Fondo decorativo */}
          <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1494515855673-102c96986359?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
          
          <div className="container relative z-10 px-4 sm:px-6 md:px-8 flex flex-col items-center text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter mb-4 sm:mb-6 max-w-3xl leading-tight">
              Transporte Universitario Inteligente <span className="text-[#D1C4E9] block sm:inline mt-2 sm:mt-0">EMI</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-blue-100 max-w-[90%] sm:max-w-[700px] mb-6 sm:mb-8 leading-relaxed px-2">
              Seguridad, puntualidad y tecnología para tu día a día universitario. 
              Monitorea tu bus en tiempo real y viaja tranquilo.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
              <Button 
                asChild 
                size="lg" 
                className="bg-white text-[#1A237E] hover:bg-blue-50 font-bold h-11 sm:h-12 text-sm sm:text-base w-full sm:w-auto"
              >
                <Link href="/login">Acceder a mi Cuenta</Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="lg" 
                className="text-white border-white border-2 hover:bg-white/10 hover:text-white h-11 sm:h-12 text-sm sm:text-base w-full sm:w-auto"
              >
                <Link href="#rutas">Ver Rutas Públicas</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* --- SECCIÓN INFORMACIÓN / CARACTERÍSTICAS --- */}
        <section id="info" className="py-12 sm:py-16 md:py-20 bg-slate-50">
          <div className="container px-4 sm:px-6 md:px-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 text-[#1A237E]">
              ¿Por qué elegir T.U.E.M.I.?
            </h2>
            <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              
              <div className="bg-white p-5 sm:p-6 md:p-8 rounded-xl shadow-sm border hover:shadow-md transition-shadow flex flex-col items-center text-center">
                <div className="p-3 sm:p-4 bg-blue-100 rounded-full mb-4 text-[#1A237E]">
                  <Clock className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">Horarios Exactos</h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  Conoce la hora estimada de llegada de cada unidad para no perder tu clase.
                </p>
              </div>

              <div className="bg-white p-5 sm:p-6 md:p-8 rounded-xl shadow-sm border hover:shadow-md transition-shadow flex flex-col items-center text-center">
                <div className="p-3 sm:p-4 bg-blue-100 rounded-full mb-4 text-[#1A237E]">
                  <MapIcon className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">Monitoreo GPS</h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  Rastreo satelital en vivo para que sepas exactamente dónde está tu transporte.
                </p>
              </div>

              <div className="bg-white p-5 sm:p-6 md:p-8 rounded-xl shadow-sm border hover:shadow-md transition-shadow flex flex-col items-center text-center md:col-span-2 lg:col-span-1">
                <div className="p-3 sm:p-4 bg-blue-100 rounded-full mb-4 text-[#1A237E]">
                  <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">Seguridad Total</h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  Conductores certificados y monitoreo constante desde la central de la EMI.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* --- SECCIÓN CONTACTO --- */}
        <section id="contacto" className="py-12 sm:py-16 md:py-20 bg-white">
          <div className="container px-4 sm:px-6 md:px-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 text-[#1A237E]">
              Contáctanos
            </h2>
            <div className="grid gap-8 sm:gap-10 md:gap-12 lg:grid-cols-2 max-w-5xl mx-auto">
              
              {/* Información de Contacto */}
              <div className="space-y-6">
                <h3 className="text-xl sm:text-2xl font-semibold text-[#1A237E]">
                  Oficina de Transporte
                </h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  Si tienes dudas sobre tu abono, rutas o sugerencias, estamos disponibles en el Bloque B, Planta Baja.
                </p>
                <div className="space-y-4 sm:space-y-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                        <MapPin className="text-[#1A237E] w-5 h-5 sm:w-6 sm:h-6 shrink-0 mt-0.5"/> 
                        <span className="text-sm sm:text-base">Av. Rafael Pabón, Campus Irpavi</span>
                    </div>
                    <div className="flex items-start gap-3 sm:gap-4">
                        <Phone className="text-[#1A237E] w-5 h-5 sm:w-6 sm:h-6 shrink-0 mt-0.5"/> 
                        <span className="text-sm sm:text-base">(2) 2123456 - Int 104</span>
                    </div>
                    <div className="flex items-start gap-3 sm:gap-4">
                        <Mail className="text-[#1A237E] w-5 h-5 sm:w-6 sm:h-6 shrink-0 mt-0.5"/> 
                        <span className="text-sm sm:text-base break-all">transporte@emi.edu.bo</span>
                    </div>
                </div>
              </div>

              {/* Formulario de Contacto */}
              <div className="bg-slate-50 p-5 sm:p-6 md:p-8 rounded-xl border shadow-sm">
                 <form className="space-y-4 sm:space-y-5">
                    <div>
                        <label className="text-sm sm:text-base font-medium mb-1.5 sm:mb-2 block">
                          Nombre
                        </label>
                        <input 
                          type="text" 
                          className="w-full p-2.5 sm:p-3 rounded-lg border border-slate-300 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#1A237E] focus:border-transparent transition-all" 
                          placeholder="Tu nombre" 
                        />
                    </div>
                    <div>
                        <label className="text-sm sm:text-base font-medium mb-1.5 sm:mb-2 block">
                          Correo Electrónico
                        </label>
                        <input 
                          type="email" 
                          className="w-full p-2.5 sm:p-3 rounded-lg border border-slate-300 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#1A237E] focus:border-transparent transition-all" 
                          placeholder="tu@email.com" 
                        />
                    </div>
                    <div>
                        <label className="text-sm sm:text-base font-medium mb-1.5 sm:mb-2 block">
                          Mensaje
                        </label>
                        <textarea 
                          className="w-full p-2.5 sm:p-3 rounded-lg border border-slate-300 h-28 sm:h-32 text-sm sm:text-base resize-none focus:outline-none focus:ring-2 focus:ring-[#1A237E] focus:border-transparent transition-all" 
                          placeholder="¿En qué podemos ayudarte?"
                        ></textarea>
                    </div>
                    <Button className="w-full bg-[#1A237E] hover:bg-[#0D1642] h-10 sm:h-11 text-sm sm:text-base font-semibold">
                      Enviar Mensaje
                    </Button>
                 </form>
              </div>

            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}