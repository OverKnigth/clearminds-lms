
import logo from '../assets/krakedev_logo.png';

export default function MigrationPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-4 selection:bg-white selection:text-black">
      <div className="max-w-xl w-full flex flex-col items-center gap-16">
        {/* Logo Section */}
        <div className="relative group">
          <div className="absolute -inset-4 bg-white/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <img 
            src={logo} 
            alt="Krake Dev Logo" 
            className="relative w-64 md:w-96 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-transform duration-700 hover:scale-105"
          />
        </div>
        
        {/* Content Section */}
        <div className="flex flex-col items-center gap-6">
          <h1 className="text-4xl md:text-6xl font-extrabold text-center tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500">
            ¡Nos hemos mudado!
          </h1>
          <p className="text-gray-400 text-center text-lg md:text-xl max-w-md font-light leading-relaxed">
            Nuestra plataforma ahora se encuentra en un nuevo lugar. Haz clic en el botón para ir a la nueva dirección.
          </p>
        </div>

        {/* Button Section */}
        <a 
          href="#" 
          // onClick={(e) => { e.preventDefault(); /* AQUI VA EL LINK LUEGO */ }}
          className="group relative inline-flex items-center justify-center px-10 py-5 font-bold text-black bg-white rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] active:scale-95"
        >
          <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-10 bg-gradient-to-b from-transparent via-transparent to-black pointer-events-none"></span>
          <span className="relative text-xl tracking-widest uppercase font-black">
            Nos Mudamos
          </span>
          <svg className="w-6 h-6 ml-3 transition-transform duration-300 group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>
      </div>
      
      {/* Background ambient light */}
      <div className="fixed inset-0 pointer-events-none flex justify-center items-center z-[-1] overflow-hidden">
        <div className="w-[800px] h-[800px] bg-white/5 rounded-full blur-[120px] opacity-20"></div>
      </div>
    </div>
  );
}
