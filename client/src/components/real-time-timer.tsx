
import { useState, useEffect } from "react";

// Função para formatar data/hora no horário do Brasil (GMT-3)
// O banco de dados já salva em horário de Brasília (datetime('now', '-3 hours'))
// Então precisamos interpretar o timestamp como já estando em horário local do Brasil
export function formatToBrazilTime(dateString: string): string {
  // Converter timestamp do SQLite (formato: "2025-10-28 21:00:00") 
  // que já está em horário de Brasília
  const cleanDate = dateString.replace(' ', 'T');
  
  // Se não tem timezone, adicionar -03:00 para indicar que já é horário de Brasília
  const dateWithTz = cleanDate.includes('T') && !cleanDate.includes('Z') && !cleanDate.includes('+') && !cleanDate.includes('-', 10)
    ? cleanDate + '-03:00'
    : cleanDate;
  
  const date = new Date(dateWithTz);
  
  // Formatar para exibição em português brasileiro
  return date.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

interface RealTimeTimerProps {
  startTime: string;
  endTime?: string;
  label?: string;
  className?: string;
  showCalculated?: boolean;
}

export function RealTimeTimer({ 
  startTime, 
  endTime, 
  label, 
  className = "",
  showCalculated = false 
}: RealTimeTimerProps) {
  const [timeString, setTimeString] = useState("");

  useEffect(() => {
    const updateTime = () => {
      // Converter strings do SQLite (formato: "2025-10-28 16:33:14") para Date
      // O SQLite armazena em UTC-3 (Brasil), precisamos adicionar o offset
      const parseDate = (dateStr: string) => {
        // Se já tem timezone, usar diretamente
        if (dateStr.includes('T') || dateStr.includes('Z') || dateStr.includes('+') || dateStr.includes('-', 10)) {
          return new Date(dateStr);
        }
        // Formato SQLite sem timezone: "YYYY-MM-DD HH:MM:SS"
        // Adicionar timezone do Brasil (UTC-3) para interpretação correta
        // Converte "2025-10-28 16:33:14" para "2025-10-28T16:33:14-03:00"
        const isoDate = dateStr.replace(' ', 'T') + '-03:00';
        return new Date(isoDate);
      };

      const start = parseDate(startTime);
      const end = endTime ? parseDate(endTime) : new Date();
      
      const diffMs = end.getTime() - start.getTime();
      
      if (diffMs < 0 || isNaN(diffMs)) {
        setTimeString("0m");
        return;
      }

      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      let timeStr = "";
      if (days > 0) {
        timeStr += `${days}d `;
      }
      if (hours > 0) {
        timeStr += `${hours}h `;
      }
      if (days === 0 && hours === 0 && minutes === 0) {
        timeStr = "< 1m";
      } else {
        timeStr += `${minutes}m`;
      }

      setTimeString(timeStr.trim());
    };

    updateTime();
    
    // Only set interval if we're showing real-time (no endTime)
    if (!endTime && !showCalculated) {
      const interval = setInterval(updateTime, 60000); // Update every minute
      return () => clearInterval(interval);
    }
  }, [startTime, endTime, showCalculated]);

  return (
    <span className={className}>
      {label && `${label}: `}{timeString}
    </span>
  );
}

