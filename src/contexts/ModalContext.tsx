"use client";

import {
    createContext,
    useContext,
    useState,
    useCallback,
    ReactNode,
} from "react";
import PasswordResetModal from "@/components/ui/modals/PasswordResetModal";
import NewsletterModal from "@/components/ui/modals/NewsletterModal";
import OrderConfirmationModal from "@/components/ui/modals/OrderConfirmationModal";
import AlertModal from "@/components/ui/modals/AlertModal";
import SignOutConfirmModal from "@/components/ui/modals/SignOutConfirmModal";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ModalType =
    | "password-reset"
    | "newsletter"
    | "order-confirmation"
    | "success"
    | "error"
    | "sign-out";

export interface PasswordResetData {
    email: string;
}

export interface OrderConfirmationData {
    orderId: string;
    total: number;
    itemCount: number;
}

export interface AlertData {
    title: string;
    message: string;
    cta?: { label: string; href: string };
}

export interface SignOutData {
    onConfirm: () => void | Promise<void>;
}

export type ModalData =
    | PasswordResetData
    | OrderConfirmationData
    | AlertData
    | SignOutData
    | null;

interface ModalState {
    type: ModalType;
    data?: ModalData;
}

interface ModalContextType {
    openModal: (type: ModalType, data?: ModalData) => void;
    closeModal: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ModalContext = createContext<ModalContextType>({
    openModal: () => { },
    closeModal: () => { },
});

export function useModal() {
    return useContext(ModalContext);
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ModalProvider({ children }: { children: ReactNode }) {
    const [modal, setModal] = useState<ModalState | null>(null);

    const openModal = useCallback((type: ModalType, data?: ModalData) => {
        setModal({ type, data });
    }, []);

    const closeModal = useCallback(() => {
        setModal(null);
    }, []);

    const renderModal = () => {
        if (!modal) return null;

        switch (modal.type) {
            case "password-reset":
                return (
                    <PasswordResetModal
                        email={(modal.data as PasswordResetData)?.email ?? ""}
                        onClose={closeModal}
                    />
                );
            case "newsletter":
                return <NewsletterModal onClose={closeModal} />;
            case "order-confirmation":
                return (
                    <OrderConfirmationModal
                        data={modal.data as OrderConfirmationData}
                        onClose={closeModal}
                    />
                );
            case "success":
                return (
                    <AlertModal
                        variant="success"
                        data={modal.data as AlertData}
                        onClose={closeModal}
                    />
                );
            case "error":
                return (
                    <AlertModal
                        variant="error"
                        data={modal.data as AlertData}
                        onClose={closeModal}
                    />
                );
            case "sign-out":
                return (
                    <SignOutConfirmModal
                        onConfirm={(modal.data as SignOutData).onConfirm}
                        onClose={closeModal}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <ModalContext.Provider value={{ openModal, closeModal }}>
            {children}
            {renderModal()}
        </ModalContext.Provider>
    );
}
