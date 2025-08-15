
import React from 'react';

interface ModalProps {
    title: string;
    children: React.ReactNode;
    onClose: () => void;
    onConfirm: (e: React.FormEvent) => void;
}

const Modal: React.FC<ModalProps> = ({ title, children, onClose, onConfirm }) => {
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
                    <div className="mt-2 px-7 py-3">
                        {children}
                    </div>
                    <div className="items-center px-4 py-3">
                        <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-700">
                            Ersetzen
                        </button>
                        <button onClick={onClose} className="mt-3 px-4 py-2 bg-gray-200 text-gray-700 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-300">
                            Abbrechen
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Modal;