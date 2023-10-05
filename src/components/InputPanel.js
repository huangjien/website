// this panel will support some listeners:
// press to start record, release then stop record, then turn voice to text
// double click or ctrl-enter then send to ai for answer

import { useEventListener, useKeyPress } from 'ahooks';
import { useRef, useState } from 'react';
import { Checkbox, Grid, TextArea, Button } from 'semantic-ui-react';

const InputPanel = () => {
    const [questionText, setQuestionText] = useState('')
    const inptRef = useRef(null);

    useEventListener(
        'mousedown', () => { console.log('start to record') }, { target: inptRef },
    );
    useEventListener(
        'mouseup', () => { console.log('stop recording') }, { target: inptRef },
    );
    useEventListener(
        'dblclick', () => { console.log('send request') }, { target: inptRef },
    );
    useKeyPress(
        'ctrl.enter',
        () => {
            console.log('send request!')
            if (!questionText) return;
            //   request2AI();
            // inputRef.current.value = '';
        },
        {
            target: inptRef,
        },

    );

    return (
        <Grid columns={2} divided='vertically' >
            <Grid.Column computer={8} tablet={9} mobile={12}>
                <Button ref={inptRef} > button </Button>
            </Grid.Column>
            <Grid.Column computer={8} tablet={9} >
                <Checkbox toggle />
                <Checkbox toggle />
            </Grid.Column>

        </Grid>
    )
}

export default InputPanel;