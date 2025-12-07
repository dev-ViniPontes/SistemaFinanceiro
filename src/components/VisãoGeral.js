import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

const VisãoGeral = ({ data }) => {
  const { receitas, classificacoes, configuracoes } = data;
  
  // Formatação de moeda
  const formatarMoeda = (valor) => {
    return `${configuracoes.moeda} ${valor.toLocaleString('pt-BR', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    })}`;
  };

  // Função para calcular diferença em meses entre duas datas no formato YYYY-MM
  const calcularMesesEntreDatas = (dataInicio, dataFim) => {
    if (!dataInicio || !dataFim) return 0;
    const [anoInicio, mesInicio] = dataInicio.split('-').map(Number);
    const [anoFim, mesFim] = dataFim.split('-').map(Number);
    
    return (anoFim - anoInicio) * 12 + (mesFim - mesInicio);
  };

  // Calcular totais do mês atual
  const totais = useMemo(() => {
    const mesAtual = configuracoes.mesAtual;
    
    // Total de receitas do mês
    const receitasDoMes = receitas
      .filter(receita => receita.data.startsWith(mesAtual))
      .reduce((total, receita) => total + receita.valor, 0);

    // Total de gastos do mês atual
    const gastosDoMes = classificacoes.reduce((total, classif) => {
      const gastosClassif = classif.itens.reduce((soma, item) => {
        let deveIncluir = false;

        if (item.tipo === 'parcelado') {
          if (!item.dataInicio) return soma;
          const mesInicio = item.dataInicio.slice(0, 7);
          const mesesDesdeInicio = calcularMesesEntreDatas(mesInicio, mesAtual);
          deveIncluir = mesesDesdeInicio >= 0 && mesesDesdeInicio < item.totalParcelas;
        } else if (item.tipo === 'gasto-fixo') {
          deveIncluir = item.mesReferencia === mesAtual;
        } else if (item.tipo === 'cartao') {
          deveIncluir = item.mesFechamento === mesAtual;
        }

        if (deveIncluir) {
          return soma + (item.valorParcela || item.valor);
        }
        return soma;
      }, 0);
      return total + gastosClassif;
    }, 0);

    const valorRestante = receitasDoMes - gastosDoMes;

    return {
      receitasDoMes,
      gastosDoMes,
      valorRestante,
      saldoInicial: receitasDoMes // Saldo inicial é o total de receitas
    };
  }, [receitas, classificacoes, configuracoes, calcularMesesEntreDatas]);

  // Organizar gastos por classificação para o grid
  const gastosPorClassificacao = useMemo(() => {
    const mesAtual = configuracoes.mesAtual;
    
    return classificacoes.map(classif => {
      const totalGastos = classif.itens.reduce((soma, item) => {
        let deveMostrar = false;

        if (item.tipo === 'parcelado') {
          if (!item.dataInicio) return soma;
          const mesInicio = item.dataInicio.slice(0, 7);
          const mesesDesdeInicio = calcularMesesEntreDatas(mesInicio, mesAtual);
          deveMostrar = mesesDesdeInicio >= 0 && mesesDesdeInicio < item.totalParcelas;
        } else if (item.tipo === 'gasto-fixo') {
          deveMostrar = item.mesReferencia === mesAtual;
        } else if (item.tipo === 'cartao') {
          deveMostrar = item.mesFechamento === mesAtual;
        }

        if (deveMostrar) {
          return soma + (item.valorParcela || item.valor);
        }
        return soma;
      }, 0);
      
      return {
        nome: classif.nome,
        total: totalGastos
      };
    }).filter(item => item.total > 0);
  }, [classificacoes, configuracoes, calcularMesesEntreDatas]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Visão Geral</h2>
        <p className="text-gray-600">
          Mês de referência: {new Date(configuracoes.mesAtual + '-01').toLocaleDateString('pt-BR', { 
            month: 'long', 
            year: 'numeric' 
          })}
        </p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Recebido</p>
              <p className="text-2xl font-bold text-success-600">
                {formatarMoeda(totais.receitasDoMes)}
              </p>
            </div>
            <div className="p-3 bg-success-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-success-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Gastos</p>
              <p className="text-2xl font-bold text-danger-600">
                {formatarMoeda(totais.gastosDoMes)}
              </p>
            </div>
            <div className="p-3 bg-danger-100 rounded-full">
              <TrendingDown className="h-6 w-6 text-danger-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Saldo Restante</p>
              <p className={`text-2xl font-bold ${
                totais.valorRestante >= 0 ? 'text-success-600' : 'text-danger-600'
              }`}>
                {formatarMoeda(Math.abs(totais.valorRestante))}
                {totais.valorRestante < 0 && ' (Déficit)'}
              </p>
            </div>
            <div className={`p-3 rounded-full ${
              totais.valorRestante >= 0 ? 'bg-success-100' : 'bg-danger-100'
            }`}>
              <DollarSign className={`h-6 w-6 ${
                totais.valorRestante >= 0 ? 'text-success-600' : 'text-danger-600'
              }`} />
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Saldo Detalhado */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalhamento do Saldo</h3>
        
        <div className="space-y-4">
          {/* Saldo Inicial (Receitas) */}
          <div className="flex justify-between items-center p-4 bg-success-50 rounded-lg border border-success-200">
            <div>
              <h4 className="font-medium text-success-800">Receitas do Mês</h4>
              <p className="text-sm text-success-600">Valor total recebido</p>
            </div>
            <span className="text-lg font-bold text-success-600">
              {formatarMoeda(totais.saldoInicial)}
            </span>
          </div>

          {/* Gastos por Classificação */}
          {gastosPorClassificacao.map((gasto, index) => (
            <div key={index} className="flex justify-between items-center p-4 bg-danger-50 rounded-lg border border-danger-200">
              <div>
                <h4 className="font-medium text-danger-800">{gasto.nome}</h4>
                <p className="text-sm text-danger-600">Gastos do mês</p>
              </div>
              <span className="text-lg font-bold text-danger-600">
                {formatarMoeda(gasto.total)}
              </span>
            </div>
          ))}

          {/* Saldo Final */}
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <h4 className="font-medium text-gray-800">Saldo Final</h4>
              <p className="text-sm text-gray-600">Receitas - Gastos</p>
            </div>
            <span className={`text-lg font-bold ${
              totais.valorRestante >= 0 ? 'text-success-600' : 'text-danger-600'
            }`}>
              {formatarMoeda(Math.abs(totais.valorRestante))}
              {totais.valorRestante < 0 && ' (Déficit)'}
            </span>
          </div>
        </div>
      </div>

      {/* Resumo por Classificação */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo por Classificação</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classificacoes.map((classif) => {
            const total = gastosPorClassificacao.find(g => g.nome === classif.nome)?.total || 0;
            const percentage = totais.receitasDoMes > 0 ? (total / totais.receitasDoMes) * 100 : 0;
            
            return (
              <div key={classif.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-gray-900">{classif.nome}</h4>
                  <span className="text-sm font-bold text-danger-600">
                    {formatarMoeda(total)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-danger-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {percentage.toFixed(1)}% das receitas
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VisãoGeral;