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
  Contacts,
  Cta,
  Footer,
  BookingModal,
} from "../sections.jsx";

/* Композиция секций и общий стейт брони. Перенесено из инлайнового
   text/babel-скрипта в index.html без изменений логики.
   Входные раскрытия секций живут в `useReveal()` (sections.jsx) на Motion —
   свой IntersectionObserver здесь больше не нужен. */
export function App() {
  const [booking, setBooking] = React.useState(false);
  const book = () => setBooking(true);

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
      <Contacts />
      <Cta onBook={book} />
      <Footer />
      <BookingModal open={booking} onClose={() => setBooking(false)} />
    </React.Fragment>
  );
}
