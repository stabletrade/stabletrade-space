import IconClose from '@/assets/icons/IconClose';
import { Modal, ModalProps } from 'antd';
import React, { useEffect } from 'react';

interface ICustomModal extends ModalProps {}

const CustomModal = ({
  children,
  centered = true,
  closable = true,
  destroyOnClose = true,
  className = '',
  getContainer = false,
  closeIcon = <IconClose />,
  ...props
}: ICustomModal) => {
  return (
    <Modal
      footer={null}
      centered={centered}
      closable={closable}
      destroyOnClose={destroyOnClose}
      className={`custom-modal ${className}`}
      getContainer={getContainer}
      closeIcon={closeIcon}
      {...props}
    >
      {children}
    </Modal>
  );
};

export default CustomModal;
