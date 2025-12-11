import React, { useState } from "react"

interface Section {
  id: number
  name: string
  position?: number | null
}

interface StoreMapProps {
  sections: Section[]
  routeSections?: Section[]
}

export default function StoreMap({
  sections,
  routeSections = [],
}: StoreMapProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!sections || sections.length === 0) return null

  const isInRoute = (sectionId: number) =>
    routeSections.some(
      routeSection =>
        routeSection.id === sectionId || routeSection.position === sectionId
    )

  return (
    <>
      {/* 🟢 Botão flutuante */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: "fixed",
          bottom: "25px",
          right: "25px",
          backgroundColor: "#4caf50",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: "58px",
          height: "58px",
          fontSize: "22px",
          cursor: "pointer",
          boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
          zIndex: 10,
        }}
        title="Abrir mapa da loja"
      >
        🗺️
      </button>

      {/* 🗺️ Modal */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              backgroundColor: "#1e1e1e",
              borderRadius: "14px",
              width: "95%",
              maxWidth: "650px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "25px",
              boxShadow: "0 0 25px rgba(0,0,0,0.4)",
            }}
          >
            <h3
              style={{
                textAlign: "center",
                marginBottom: "15px",
                color: "#c8e6c9",
              }}
            >
              🗺️ Mapa Completo da Loja
            </h3>

            {/* Grid responsivo */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: "15px",
              }}
            >
              {sections.map(section => (
                <div
                  key={section.id}
                  style={{
                    backgroundColor: isInRoute(section.id)
                      ? "#ffc107" // amarelo se faz parte da rota
                      : "#2e7d32", // verde padrão
                    padding: "18px 10px",
                    borderRadius: "10px",
                    minHeight: "80px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 3px 8px rgba(0,0,0,0.3)",
                    transition: "all 0.2s ease",
                  }}
                >
                  <strong
                    style={{
                      fontSize: "15px",
                      marginBottom: "4px",
                      color: isInRoute(section.id) ? "#000" : "white",
                    }}
                  >
                    Seção {section.position ?? section.id}
                  </strong>
                  <p
                    style={{
                      fontSize: "13px",
                      color: isInRoute(section.id) ? "#333" : "#c8e6c9",
                      textAlign: "center",
                      lineHeight: "1.2",
                    }}
                  >
                    {section.name}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ textAlign: "center", marginTop: "25px" }}>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  backgroundColor: "#f44336",
                  color: "white",
                  padding: "10px 25px",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
