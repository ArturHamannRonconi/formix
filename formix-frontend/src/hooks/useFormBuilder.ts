'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getForm,
  createForm,
  updateForm,
  publishForm as publishFormService,
  closeForm as closeFormService,
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
    async (type: QuestionType) => {
      let fId = currentFormId;
      if (!fId) {
        fId = await saveForm();
      }

      const order = questions.length;
      const { questionId } = await addQuestionService(fId, {
        type,
        label: '',
        required: false,
        order,
      });

      const newQuestion: Question = {
        id: questionId,
        formId: fId,
        organizationId: '',
        type,
        label: '',
        required: false,
        order,
        createdAt: new Date().toISOString(),
      };

      setQuestions((prev) => [...prev, newQuestion]);
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
    return publishFormService(currentFormId);
  }, [currentFormId]);

  const closeForm = useCallback(async () => {
    if (!currentFormId) throw new Error('Formulário não salvo');
    return closeFormService(currentFormId);
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
    addQuestion,
    updateQuestion,
    removeQuestion,
    reorderQuestions,
    saveForm,
    publishForm,
    closeForm,
  };
}
