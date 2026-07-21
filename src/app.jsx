import React from "react";
import {
  Header,
  DotNav,
  Hero,
  About,
  Works,
  Process,
  Services,
  Benefits,
  Testimonials,
  Faq,
  Cta,
  Footer,
  BookingModal,
} from "../sections.jsx";

/* Композиция секций и общий стейт брони. Перенесено из инлайнового
   text/babel-скрипта в index.html без изменений логики. */
export function App() {
  const [booking, setBooking] = React.useState(false);
  const book = () => setBooking(true);

  React.useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("rt-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll(".rt-reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <React.Fragment>
      <Header onBook={book} />
      <DotNav />
      <Hero onBook={book} />
      <About />
      <Works onBook={book} />
      <Process />
      <Services onBook={book} />
      <Benefits />
      <Testimonials />
      <Faq />
      <Cta onBook={book} />
      <Footer />
      <BookingModal open={booking} onClose={() => setBooking(false)} />
    </React.Fragment>
  );
}
