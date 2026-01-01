// // src/hooks/useAppInitialization.ts
// import { useEffect } from 'react';
// import { useChatStore } from '../state/useChatStore';

// export const useAppInitialization = () => {
//   const { checkAuth, isLoading } = useChatStore();

//   useEffect(() => {
//     // Solo damos la orden: "Verifica quién soy"
//     // El store se encargará de cargar los datos si la verificación es exitosa.
//     checkAuth();
    
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   return { isLoading };
// };