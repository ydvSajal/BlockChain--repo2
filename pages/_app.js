
import "../styles/globals.css";

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }) {
  return (
  
          <Component {...pageProps} />
         
  );
}

export default MyApp;
