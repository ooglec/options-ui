import { useToast } from '@chakra-ui/react'

export const showToast = (title, desc, status) => {
    const toast = useToast();
    toast({
        title: title,
        description: desc,
        status: status,
        duration: 5000,
        isClosable: true,
    })
  
}
