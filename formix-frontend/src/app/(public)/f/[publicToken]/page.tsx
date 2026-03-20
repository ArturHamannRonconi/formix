'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { getPublicForm, submitResponse } from '@/services/responses/responses.service';
import type { PublicForm, Answer } from '@/services/responses/responses.types';
import { QuestionRenderer } from '@/modules/QuestionRenderer/QuestionRenderer';
import { EmailInput } from '@/components/inputs';
import { Button } from '@/components/ui/button';

type PageState = 'loading' | 'error' | 'form' | 'submitting' | 'success';

export default function PublicFormPage() {
  const params = useParams<{ publicToken: string }>();
  const { publicToken } = params;

  const [state, setState] = useState<PageState>('loading');
  const [form, setForm] = useState<PublicForm | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [answerErrors, setAnswerErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    getPublicForm(publicToken)
      .then((data) => {
        if (data.status !== 'active') {
          setErrorMessage(
            data.status === 'expired'
              ? 'Este formulário expirou.'
              : 'Este formulário não está mais aceitando respostas.',
          );
          setState('error');
        } else {
          setForm(data);
          setState('form');
        }
      })
      .catch(() => {
        setErrorMessage('Formulário não encontrado.');
        setState('error');
      });
  }, [publicToken]);

  function handleAnswerChange(questionId: string, value: unknown) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setAnswerErrors((prev) => ({ ...prev, [questionId]: '' }));
  }

  function validate(): boolean {
    let valid = true;
    const newErrors: Record<string, string> = {};

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Email válido é obrigatório');
      valid = false;
    } else {
      setEmailError('');
    }

    if (!form) return false;
    for (const question of form.questions) {
      const value = answers[question.id];
      if (question.required) {
        if (
          value === undefined ||
          value === null ||
          value === '' ||
          (Array.isArray(value) && value.length === 0)
        ) {
          newErrors[question.id] = 'Este campo é obrigatório';
          valid = false;
        }
      }
    }

    setAnswerErrors(newErrors);
    return valid;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setState('submitting');
    setSubmitError('');

    const answersArray: Answer[] = Object.entries(answers).map(([questionId, value]) => ({
      questionId,
      value,
    }));

    try {
      await submitResponse(publicToken, { email, answers: answersArray });
      setState('success');
    } catch (err: unknown) {
      setState('form');
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;
      const msg = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      if (status === 409) {
        setSubmitError('Você já respondeu este formulário.');
      } else if (status === 403) {
        setSubmitError('Seu domínio de email não é permitido neste formulário.');
      } else if (status === 400) {
        setSubmitError(typeof msg === 'string' ? msg : 'Resposta inválida. Verifique os campos.');
      } else {
        setSubmitError('Erro ao enviar resposta. Tente novamente.');
      }
    }
  }

  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Carregando formulário...</p>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="text-2xl font-bold">Formulário indisponível</h1>
          <p className="text-muted-foreground">{errorMessage}</p>
        </div>
      </div>
    );
  }

  if (state === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="text-5xl">✓</div>
          <h1 className="text-2xl font-bold">Resposta enviada com sucesso!</h1>
          <p className="text-muted-foreground">Obrigado por responder este formulário.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{form!.title}</h1>
          {form!.description && (
            <p className="text-muted-foreground">{form!.description}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <EmailInput
            label="Seu email"
            value={email}
            onChange={setEmail}
            required
            error={emailError}
            placeholder="seu@email.com"
          />

          {form!.questions.map((question) => (
            <QuestionRenderer
              key={question.id}
              question={question}
              value={answers[question.id]}
              onChange={(v) => handleAnswerChange(question.id, v)}
              error={answerErrors[question.id]}
            />
          ))}

          {submitError && (
            <p className="text-sm text-destructive" role="alert">{submitError}</p>
          )}

          <Button type="submit" disabled={state === 'submitting'} className="w-full">
            {state === 'submitting' ? 'Enviando...' : 'Enviar resposta'}
          </Button>
        </form>
      </div>
    </div>
  );
}
