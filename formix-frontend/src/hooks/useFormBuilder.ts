'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getForm,
  createForm,
  updateForm,
  publishForm as publishFormService,
  closeForm as closeFormService,
  expireForm as expireFormService,
  addQuestion as addQuestionService,
  updateQuestion as updateQuestionService,
  removeQuestion as removeQuestionService,
  reorderQuestions as reorderQuestionsService,
} from '@/services/forms/forms.service';
import type { Question, QuestionType, FormSettings } from '@/services/forms/forms.types';

interface FormData {
  title: string;
  description: string;
  settings: FormSettings;
}

const defaultSettings: FormSettings = {
  allowMultipleResponses: false,
  allowedEmailDomains: [],
};

const defaultFormData: FormData = {
  title: 'Novo formulário',
  description: '',
  settings: defaultSettings,
};

export function useFormBuilder(formId?: string) {
  const [currentFormId, setCurrentFormId] = useState<string | null>(formId ?? null);
  const [formData, setFormDataState] = useState<FormData>(defaultFormData);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(!!formId);
  const [publicToken, setPublicToken] = useState<string | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!formId) return;
    setIsLoading(true);
    getForm(formId)
      .then((form) => {
        setFormDataState({
          title: form.title,
          description: form.description ?? '',
          settings: form.settings,
        });
        setQuestions(form.questions.slice().sort((a, b) => a.order - b.order));
        setPublicToken(form.publicToken ?? null);
        isFirstRender.current = false;
      })
      .catch((err) => {
        throw err;
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [formId]);

  function setFormData(updater: Partial<FormData> | ((prev: FormData) => FormData)) {
    setFormDataState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      return next;
    });
    if (!isFirstRender.current) {
      setIsDirty(true);
    }
  }

  const saveForm = useCallback(async (): Promise<string> => {
    if (currentFormId) {
      await updateForm(currentFormId, {
        title: formData.title,
        description: formData.description || undefined,
        settings: formData.settings,
      });
      setIsDirty(false);
      return currentFormId;
    } else {
      const { formId: newId } = await createForm({
        title: formData.title,
        description: formData.description || undefined,
      });
      setCurrentFormId(newId);
      setIsDirty(false);
      return newId;
    }
  }, [currentFormId, formData]);

  const addQuestion = useCallback(
    async (type: QuestionType): Promise<{ formId: string }> => {
      let fId = currentFormId;
      if (!fId) {
        fId = await saveForm();
      }

      const order = questions.length;
      const typesWithOptions = ['checkbox', 'radio', 'dropdown'];
      const defaultOptions = typesWithOptions.includes(type) ? ['Opção 1'] : undefined;

      const { questionId } = await addQuestionService(fId, {
        type,
        label: 'Nova pergunta',
        required: false,
        order,
        options: defaultOptions,
      });

      const newQuestion: Question = {
        id: questionId,
        formId: fId,
        organizationId: '',
        type,
        label: 'Nova pergunta',
        required: false,
        order,
        options: defaultOptions,
        createdAt: new Date().toISOString(),
      };

      setQuestions((prev) => [...prev, newQuestion]);
      setIsDirty(true);
      return { formId: fId };
    },
    [currentFormId, questions.length, saveForm],
  );

  const updateQuestion = useCallback(
    async (id: string, data: Partial<Question>) => {
      if (!currentFormId) return;
      await updateQuestionService(currentFormId, id, data);
      setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...data } : q)));
    },
    [currentFormId],
  );

  const removeQuestion = useCallback(
    async (id: string) => {
      if (!currentFormId) return;
      await removeQuestionService(currentFormId, id);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    },
    [currentFormId],
  );

  const reorderQuestions = useCallback(
    async (newQuestions: Question[]) => {
      if (!currentFormId) return;
      const reordered = newQuestions.map((q, index) => ({ ...q, order: index }));
      setQuestions(reordered);
      await reorderQuestionsService(
        currentFormId,
        reordered.map((q) => ({ id: q.id, order: q.order })),
      );
    },
    [currentFormId],
  );

  const publishForm = useCallback(async () => {
    if (!currentFormId) throw new Error('Formulário não salvo');
    const result = await publishFormService(currentFormId);
    setPublicToken(result.publicToken);
    return result;
  }, [currentFormId]);

  const closeForm = useCallback(async () => {
    if (!currentFormId) throw new Error('Formulário não salvo');
    return closeFormService(currentFormId);
  }, [currentFormId]);

  const expireForm = useCallback(async () => {
    if (!currentFormId) throw new Error('Formulário não salvo');
    await expireFormService(currentFormId);
    setPublicToken(null);
  }, [currentFormId]);

  // Mark not first render after initial load is done
  useEffect(() => {
    if (!formId && isFirstRender.current) {
      isFirstRender.current = false;
    }
  }, [formId]);

  return {
    formId: currentFormId,
    formData,
    setFormData,
    questions,
    isDirty,
    isLoading,
    publicToken,
    addQuestion,
    updateQuestion,
    removeQuestion,
    reorderQuestions,
    saveForm,
    publishForm,
    closeForm,
    expireForm,
  };
}
