import { Input } from '@nextui-org/react';
import { useControllableValue } from 'ahooks';

export const ControllableInput = (props) => {
    const [value, setValue] = useControllableValue(props)

    return (
        <Input {...props} value={value} onChange={(e) => setValue(e.target.value)} />
    )
}