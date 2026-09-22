/**
 * Preguntas fijas de la página de invitación. Las respuestas se editan desde
 * el panel; una pregunta sin respuesta simplemente no se muestra.
 *
 * "oficial" es obligatoria por honestidad: aclara que esta página no es de
 * Yanbal. Por eso lleva una respuesta base que no depende del panel.
 */
export const JOIN_FAQ = [
  { key: "trabajo", question: "¿Tengo que dejar mi trabajo?" },
  { key: "tiempo", question: "¿Cuánto tiempo necesito?" },
  { key: "costo", question: "¿Cuánto cuesta empezar?" },
  { key: "comprar", question: "¿Tengo que comprar productos cada campaña?" },
  { key: "vender", question: "¿Necesito saber vender?" },
  { key: "oficial", question: "¿Es oficial de Yanbal?" },
] as const;

export type JoinFaqKey = (typeof JOIN_FAQ)[number]["key"];
