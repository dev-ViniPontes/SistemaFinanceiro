import React, { useMemo, useState } from 'react';
import { Calendar, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

const GastosFuturos = ({ data }) => {
  const { receitas, classificacoes, configuracoes } = data;
  
  // Estado para o mês selecionado
  const [mesSelecionado, setMesSelecionado] = useState(configuracoes.mesAtual);

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

  // Obter lista de meses disponíveis
  const mesesDisponiveis = useMemo(() => {
    const meses = new Set();
    
    // Adicionar mês atual
    meses.add(configuracoes.mesAtual);
    
    // Adicionar meses de receitas
    receitas.forEach(receita => {
      const mes = receita.data.slice(0, 7);
      meses.add(mes);
    });
    
    // Adicionar meses de itens parcelados
    classificacoes.forEach(classif => {
      classif.itens.forEach(item => {
        if (item.tipo === 'parcelado' && item.dataInicio) {
          const mesInicio = item.dataInicio.slice(0, 7);
          meses.add(mesInicio);
          
          // Adicionar meses das parcelas futuras
          for (let i = 0; i < item.totalParcelas; i++) {
            const [ano, mes] = mesInicio.split('-').map(Number);
            const mesParcela = `${ano}-${String(mes + i).padStart(2, '0')}`;
            meses.add(mesParcela);
          }
        } else if (item.tipo === 'gasto-fixo' && item.mesReferencia) {
          meses.add(item.mesReferencia);
        } else if (item.tipo === 'cartao' && item.mesFechamento) {
          meses.add(item.mesFechamento);
        }
      });
    });
    
    // Converter para array e ordenar
    return Array.from(meses).sort();
  }, [receitas, classificacoes, configuracoes.mesAtual]);

  // Calcular dados do mês selecionado
  const dadosMes = useMemo(() => {
    const mesSelecionadoAtual = mesSelecionado;
    const mesCorrente = configuracoes.mesAtual;

    // Agrupar receitas por mês
    const receitasPorMes = {};
    receitas.forEach(receita => {
      const mes = receita.data.slice(0, 7);
      if (!receitasPorMes[mes]) receitasPorMes[mes] = 0;
      receitasPorMes[mes] += receita.valor;
    });

    // Obter o último mês com receita para projeção
    const mesesComReceitas = Object.keys(receitasPorMes).sort().reverse();
    const ultimoMesComReceita = mesesComReceitas[0];
    const valorProjetado = ultimoMesComReceita ? receitasPorMes[ultimoMesComReceita] : 0;

    // Total de receitas do mês: atual se passado/presente, projetado se futuro
    let receitasDoMes;
    if (mesSelecionadoAtual <= mesCorrente) {
      receitasDoMes = receitasPorMes[mesSelecionadoAtual] || 0;
    } else {
      receitasDoMes = valorProjetado;
    }

    // Total de gastos do mês
    const gastosDoMes = classificacoes.reduce((total, classif) => {
      const gastosClassif = classif.itens.reduce((soma, item) => {
        if (!item.dataInicio && !item.mesReferencia && !item.mesFechamento) return soma;

        let deveMostrar = false;

        if (item.tipo === 'parcelado') {
          if (!item.dataInicio) return soma;
          const mesInicio = item.dataInicio.slice(0, 7);
          const mesesDesdeInicio = calcularMesesEntreDatas(mesInicio, mesSelecionadoAtual);
          deveMostrar = mesesDesdeInicio >= 0 && mesesDesdeInicio < item.totalParcelas;
        } else if (item.tipo === 'gasto-fixo') {
          deveMostrar = true; // Gastos fixos aparecem em todos os meses
        } else if (item.tipo === 'cartao') {
          deveMostrar = item.mesFechamento === mesSelecionadoAtual;
        }

        if (deveMostrar) {
          return soma + (item.valorParcela || item.valor);
        }
        return soma;
      }, 0);

      return total + gastosClassif;
    }, 0);

    const saldo = receitasDoMes - gastosDoMes;

    return {
      receitasDoMes,
      gastosDoMes,
      saldo
    };
  }, [receitas, classificacoes, mesSelecionado, configuracoes.mesAtual, calcularMesesEntreDatas]);

  // Gastos por classificação
  const gastosPorClassificacao = useMemo(() => {
    const mesAtual = mesSelecionado;
    
    return classificacoes.map(classif => {
      const totalGastos = classif.itens.reduce((soma, item) => {
        if (!item.dataInicio && !item.mesReferencia && !item.mesFechamento) return soma;
        
        let deveMostrar = false;
        
        if (item.tipo === 'parcelado') {
          if (!item.dataInicio) return soma;
          const mesInicio = item.dataInicio.slice(0, 7);
          const mesesDesdeInicio = calcularMesesEntreDatas(mesInicio, mesAtual);
          deveMostrar = mesesDesdeInicio >= 0 && mesesDesdeInicio < item.totalParcelas;
        } else if (item.tipo === 'gasto-fixo') {
          deveMostrar = true; // Gastos fixos aparecem em todos os meses
        } else if (item.tipo === 'cartao') {
          deveMostrar = item.mesFechamento === mesAtual;
        }
        
        if (deveMostrar) {
          return soma + (item.valorParcela || item.valor);
        }
        return soma;
      }, 0);
      
      return {
        id: classif.id,
        nome: classif.nome,
        total: totalGastos,
        itens: classif.itens.filter(item => {
          let deveMostrar = false;
          
          if (item.tipo === 'parcelado') {
            if (!item.dataInicio) return false;
            const mesInicio = item.dataInicio.slice(0, 7);
            const mesesDesdeInicio = calcularMesesEntreDatas(mesInicio, mesAtual);
            deveMostrar = mesesDesdeInicio >= 0 && mesesDesdeInicio < item.totalParcelas;
          } else if (item.tipo === 'gasto-fixo') {
            deveMostrar = true; // Gastos fixos aparecem em todos os meses
          } else if (item.tipo === 'cartao') {
            deveMostrar = item.mesFechamento === mesAtual;
          }
          
          return deveMostrar;
        })
      };
    }).filter(item => item.total > 0);
  }, [classificacoes, mesSelecionado, calcularMesesEntreDatas]);

  const formatarMes = (mes) => {
    const [ano, mesNum] = mes.split('-');
    const data = new Date(ano, mesNum - 1);
    return data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const calcularParcelaAtual = (item) => {
    if (!item.dataInicio) return 1;
    const mesesDesdeInicio = calcularMesesEntreDatas(
      item.dataInicio.slice(0, 7), 
      mesSelecionado
    );
    return mesesDesdeInicio + 1;
  };

  const getIconeTipo = (tipo) => {
    switch (tipo) {
      case 'parcelado': return '🚗';
      case 'cartao': return '💳';
      case 'gasto-fixo': return '💰';
      default: return '💰';
    }
  };

  const getNomeTipo = (tipo) => {
    const tipos = {
      'parcelado': 'Parcelado',
      'cartao': 'Cartão',
      'gasto-fixo': 'Gasto Fixo'
    };
    return tipos[tipo] || tipo;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Gastos Futuros</h2>
        <p className="text-gray-600">
          Visualize e planeje seus gastos futuros por mês.
        </p>
      </div>

      {/* Seletor de Mês */}
      <div className="card p-6">
        <div className="flex items-center space-x-4">
          <Calendar className="h-5 w-5 text-primary-600" />
          <div className="flex-1">
            <label className="label">Selecionar Mês</label>
            <select
              value={mesSelecionado}
              onChange={(e) => setMesSelecionado(e.target.value)}
              className="input"
            >
              {mesesDisponiveis.map(mes => (
                <option key={mes} value={mes}>
                  {formatarMes(mes)}
                </option>
              ))}
            </select>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Mês selecionado</p>
            <p className="font-semibold text-gray-900">
              {formatarMes(mesSelecionado)}
            </p>
          </div>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Salário Previsto</p>
              <p className="text-2xl font-bold text-success-600">
                {formatarMoeda(dadosMes.receitasDoMes)}
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
              <p className="text-sm font-medium text-gray-600">Total Gastos Futuros</p>
              <p className="text-2xl font-bold text-danger-600">
                {formatarMoeda(dadosMes.gastosDoMes)}
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
              <p className="text-sm font-medium text-gray-600">Saldo Previsto</p>
              <p className={`text-2xl font-bold ${
                dadosMes.saldo >= 0 ? 'text-success-600' : 'text-danger-600'
              }`}>
                {formatarMoeda(Math.abs(dadosMes.saldo))}
                {dadosMes.saldo < 0 && ' (Déficit)'}
              </p>
            </div>
            <div className={`p-3 rounded-full ${
              dadosMes.saldo >= 0 ? 'bg-success-100' : 'bg-danger-100'
            }`}>
              <DollarSign className={`h-6 w-6 ${
                dadosMes.saldo >= 0 ? 'text-success-600' : 'text-danger-600'
              }`} />
            </div>
          </div>
        </div>
      </div>

      {/* Gastos por Classificação */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Gastos por Classificação - {formatarMes(mesSelecionado)}
        </h3>
        
        {gastosPorClassificacao.length === 0 ? (
          <div className="card p-8 text-center">
            <DollarSign className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-500">Nenhum gasto previsto para este mês</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {gastosPorClassificacao.map((classif) => (
              <div key={classif.id} className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">{classif.nome}</h4>
                  <span className="text-lg font-bold text-danger-600">
                    {formatarMoeda(classif.total)}
                  </span>
                </div>

                <div className="space-y-3">
                  {classif.itens.map((item) => (
                    <div key={item.id} className="p-3 bg-gray-50 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">{getIconeTipo(item.tipo)}</span>
                          <div>
                            <p className="font-medium text-sm">{item.nome}</p>
                            <p className="text-xs text-gray-500">
                              {getNomeTipo(item.tipo)}
                              {item.tipo === 'parcelado' && ` (${calcularParcelaAtual(item)}/${item.totalParcelas})`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm text-danger-600">
                            {formatarMoeda(item.valorParcela || item.valor)}
                          </p>
                          {item.tipo === 'parcelado' && (
                            <p className="text-xs text-gray-500">
                              {formatarMoeda(item.valorParcela)}/parcela
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {item.tipo === 'parcelado' && (
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div 
                              className="bg-primary-600 h-1 rounded-full"
                              style={{ 
                                width: `${(calcularParcelaAtual(item) / item.totalParcelas) * 100}%` 
                              }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Progresso: {calcularParcelaAtual(item)} de {item.totalParcelas} parcelas
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resumo Percentual */}
      {gastosPorClassificacao.length > 0 && dadosMes.receitasDoMes > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Análise Percentual</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gastosPorClassificacao.map((gasto) => {
              const percentage = (gasto.total / dadosMes.receitasDoMes) * 100;
              
              return (
                <div key={gasto.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-900">{gasto.nome}</h4>
                    <span className="text-sm font-bold text-danger-600">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-danger-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatarMoeda(gasto.total)} do salário
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default GastosFuturos;