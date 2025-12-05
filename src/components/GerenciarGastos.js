import React, { useState } from 'react';
import { Plus, Car, CreditCard, DollarSign, X } from 'lucide-react';

const GerenciarGastos = ({ data, onAdicionarItem }) => {
  const { classificacoes, configuracoes } = data;
  const [classificacaoSelecionada, setClassificacaoSelecionada] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'parcelado', // parcelado, gasto-fixo, cartao
    valor: '',
    valorParcela: '',
    totalParcelas: '',
    mesInicio: '',
    mesFechamento: '',
    mesReferencia: configuracoes.mesAtual
  });

  const [erro, setErro] = useState('');

  const tiposItem = [
    { id: 'parcelado', nome: 'Parcelado', descricao: 'Financiamentos e empréstimos' },
    { id: 'gasto-fixo', nome: 'Gasto Fixo', descricao: 'Despesa mensal recorrente' },
    { id: 'cartao', nome: 'Cartão de Crédito', descricao: 'Compra no cartão com fechamento' }
  ];

  const formatarMoeda = (valor) => {
    return `${configuracoes.moeda} ${valor.toLocaleString('pt-BR', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    })}`;
  };

  const calcularMesesEntreDatas = (dataInicio, dataFim) => {
    if (!dataInicio || !dataFim) return 0;
    const [anoInicio, mesInicio] = dataInicio.split('-').map(Number);
    const [anoFim, mesFim] = dataFim.split('-').map(Number);
    
    return (anoFim - anoInicio) * 12 + (mesFim - mesInicio);
  };

  const calcularParcelaAtual = (item) => {
    const mesesDesdeInicio = calcularMesesEntreDatas(
      item.dataInicio.slice(0, 7), 
      configuracoes.mesAtual
    );
    return mesesDesdeInicio + 1;
  };

  const deveMostrarItem = (item) => {
    const mesesDesdeInicio = calcularMesesEntreDatas(
      item.dataInicio.slice(0, 7), 
      configuracoes.mesAtual
    );
    
    switch (item.tipo) {
      case 'parcelado':
        return mesesDesdeInicio < item.totalParcelas;
      case 'gasto-fixo':
        return item.mesReferencia === configuracoes.mesAtual;
      case 'cartao':
        return item.mesFechamento === configuracoes.mesAtual;
      default:
        return false;
    }
  };

  const valorItemNoMes = (item) => {
    if (!deveMostrarItem(item)) return 0;
    return item.valorParcela || item.valor;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErro('');

    // Validações
    if (!formData.nome.trim()) {
      setErro('Nome do item é obrigatório');
      return;
    }

    const valor = parseFloat(formData.valor);
    if (isNaN(valor) || valor <= 0) {
      setErro('Valor deve ser maior que zero');
      return;
    }

    // Validações específicas por tipo
    if (formData.tipo === 'parcelado') {
      const totalParcelas = parseInt(formData.totalParcelas);
      const valorParcela = parseFloat(formData.valorParcela);
      
      if (isNaN(totalParcelas) || totalParcelas <= 0) {
        setErro('Total de parcelas deve ser maior que zero');
        return;
      }
      
      if (isNaN(valorParcela) || valorParcela <= 0) {
        setErro('Valor da parcela deve ser maior que zero');
        return;
      }

      if (!formData.mesInicio) {
        setErro('Mês de início é obrigatório para itens parcelados');
        return;
      }
    }

    if (formData.tipo === 'gasto-fixo' && !formData.mesReferencia) {
      setErro('Mês de referência é obrigatório para gastos fixos');
      return;
    }

    if (formData.tipo === 'cartao' && !formData.mesFechamento) {
      setErro('Mês de fechamento é obrigatório para cartão de crédito');
      return;
    }

    // Criar item
    const novoItem = {
      nome: formData.nome,
      tipo: formData.tipo,
      valor: valor,
      valorParcela: formData.tipo === 'parcelado' ? parseFloat(formData.valorParcela) : null,
      totalParcelas: formData.tipo === 'parcelado' ? parseInt(formData.totalParcelas) : null,
      dataInicio: formData.mesInicio ? `${formData.mesInicio}-01` : null,
      mesReferencia: formData.mesReferencia,
      mesFechamento: formData.mesFechamento,
      ativo: true
    };

    onAdicionarItem(classificacaoSelecionada.id, novoItem);

    // Limpar formulário
    setFormData({
      nome: '',
      tipo: 'parcelado',
      valor: '',
      valorParcela: '',
      totalParcelas: '',
      mesInicio: '',
      mesFechamento: '',
      mesReferencia: configuracoes.mesAtual
    });
    setModalAberto(false);

    alert('Item adicionado com sucesso!');
  };

  const abrirModal = (classificacao) => {
    setClassificacaoSelecionada(classificacao);
    setModalAberto(true);
    setErro('');
  };

  const fecharModal = () => {
    setModalAberto(false);
    setFormData({
      nome: '',
      tipo: 'parcelado',
      valor: '',
      valorParcela: '',
      totalParcelas: '',
      mesInicio: '',
      mesFechamento: '',
      mesReferencia: configuracoes.mesAtual
    });
  };

  const getIconeTipo = (tipo) => {
    switch (tipo) {
      case 'parcelado': return <Car className="h-4 w-4" />;
      case 'cartao': return <CreditCard className="h-4 w-4" />;
      case 'gasto-fixo': return <DollarSign className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const getNomeTipo = (tipo) => {
    return tiposItem.find(t => t.id === tipo)?.nome || tipo;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Gerenciar Gastos</h2>
        <p className="text-gray-600">
          Organize seus gastos por classificação e controle parcelas automaticamente.
        </p>
      </div>

      {/* Lista de Classificações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {classificacoes.map((classif) => {
          const totalItens = classif.itens.length;
          const itensAtivos = classif.itens.filter(item => item.ativo).length;
          const valorTotalMes = classif.itens
            .filter(item => deveMostrarItem(item))
            .reduce((total, item) => total + valorItemNoMes(item), 0);

          return (
            <div key={classif.id} className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{classif.nome}</h3>
                <button
                  onClick={() => abrirModal(classif)}
                  className="btn btn-primary text-sm flex items-center space-x-1"
                >
                  <Plus size={16} />
                  <span>Adicionar Item</span>
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Itens ativos:</span>
                  <span className="font-medium">{itensAtivos}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total do mês:</span>
                  <span className="font-medium text-danger-600">
                    {formatarMoeda(valorTotalMes)}
                  </span>
                </div>
              </div>

              {/* Lista de Itens */}
              <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                {classif.itens.filter(item => item.ativo).map((item) => (
                  <div key={item.id} className="p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getIconeTipo(item.tipo)}
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
                          {formatarMoeda(valorItemNoMes(item))}
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
                
                {totalItens === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhum item adicionado ainda</p>
                    <button
                      onClick={() => abrirModal(classif)}
                      className="btn btn-primary mt-3"
                    >
                      Adicionar Primeiro Item
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal para Adicionar Item */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Adicionar Item - {classificacaoSelecionada?.nome}
                </h3>
                <button
                  onClick={fecharModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {erro && (
                  <div className="bg-danger-50 border border-danger-200 rounded-lg p-3">
                    <p className="text-danger-700 text-sm">{erro}</p>
                  </div>
                )}

                <div>
                  <label className="label">Nome do Item *</label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    className="input"
                    placeholder="Ex: Financiamento Civic, Gasolina..."
                    required
                  />
                </div>

                <div>
                  <label className="label">Tipo de Gasto *</label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value }))}
                    className="input"
                  >
                    {tiposItem.map((tipo) => (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.nome} - {tipo.descricao}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Valor Total *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      value={formData.valor}
                      onChange={(e) => setFormData(prev => ({ ...prev, valor: e.target.value }))}
                      className="input pl-10"
                      placeholder="0,00"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                </div>

                {/* Campos específicos por tipo */}
                {formData.tipo === 'parcelado' && (
                  <>
                    <div>
                      <label className="label">Valor da Parcela *</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <DollarSign className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          value={formData.valorParcela}
                          onChange={(e) => setFormData(prev => ({ ...prev, valorParcela: e.target.value }))}
                          className="input pl-10"
                          placeholder="0,00"
                          step="0.01"
                          min="0"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="label">Total de Parcelas *</label>
                      <input
                        type="number"
                        value={formData.totalParcelas}
                        onChange={(e) => setFormData(prev => ({ ...prev, totalParcelas: e.target.value }))}
                        className="input"
                        placeholder="24"
                        min="1"
                        required
                      />
                    </div>

                    <div>
                      <label className="label">Mês de Início *</label>
                      <input
                        type="month"
                        value={formData.mesInicio}
                        onChange={(e) => setFormData(prev => ({ ...prev, mesInicio: e.target.value }))}
                        className="input"
                        required
                      />
                    </div>
                  </>
                )}

                {formData.tipo === 'gasto-fixo' && (
                  <div>
                    <label className="label">Mês de Referência *</label>
                    <input
                      type="month"
                      value={formData.mesReferencia}
                      onChange={(e) => setFormData(prev => ({ ...prev, mesReferencia: e.target.value }))}
                      className="input"
                      required
                    />
                  </div>
                )}

                {formData.tipo === 'cartao' && (
                  <div>
                    <label className="label">Mês de Fechamento *</label>
                    <input
                      type="month"
                      value={formData.mesFechamento}
                      onChange={(e) => setFormData(prev => ({ ...prev, mesFechamento: e.target.value }))}
                      className="input"
                      required
                    />
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="btn btn-primary flex-1"
                  >
                    Adicionar Item
                  </button>
                  <button
                    type="button"
                    onClick={fecharModal}
                    className="btn btn-secondary"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Explicação dos Tipos */}
      <div className="card p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">ℹ️ Tipos de Gastos</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start space-x-2">
            <Car className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800">Parcelado</h4>
              <p className="text-blue-700">Financiamentos e empréstimos que aparecem mês a mês até quitar.</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <DollarSign className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800">Gasto Fixo</h4>
              <p className="text-blue-700">Despesas que aparecem apenas no mês especificado.</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <CreditCard className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800">Cartão</h4>
              <p className="text-blue-700">Compras no cartão que aparecem apenas no mês de fechamento.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GerenciarGastos;