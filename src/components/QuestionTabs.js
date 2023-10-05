import { Tab, Tabs, Card, CardBody, Button, Textarea, Tooltip, RadioGroup, Radio, Input } from "@nextui-org/react";
import { useState } from "react";
import { BiMessageRoundedDetail, BiMicrophone, BiSolidThermometer } from 'react-icons/bi'

export const QuestionTabs = () => {
    const [hold, setHold] = useState(false)
    const [longPressDetected, setLongPressDetected] = useState(false)
    let pressTimer = null;


    const startPress = () => {
        setLongPressDetected(false);
        pressTimer = setTimeout(() => {
            console.log('Long Press Triggered');
            setHold(true)
            setLongPressDetected(true);
        }, 400);
    };

    const endPress = () => {
        clearTimeout(pressTimer);
        if (longPressDetected) {
            console.log('Long Press Released');

        } else {
            console.log('Short Press Triggered');
        }
        setHold(false)
        setLongPressDetected(false);
    };

    return (
        <Tabs radius="md w-auto m-2" size="lg" classNames={{
            tabList: "gap-6 justify-evenly w-full relative rounded m-1 ",
            cursor: "w-full ",
            tab: "w-fit  h-12",

        }} >
            <Tab title={<h2 className=' text-xl'>Chat</h2>}>
                <Card>
                    <CardBody  >
                        <div className=" inline-flex justify-items-stretch items-stretch justify-between">
                            <Textarea className="inline-block m-1 lg:w-10/12 sm:w-8/12 max-h-full" />
                            <Tooltip placement="bottom" content={
                                <div className="px-1 py-2">
                                    <div className="text-small">Clik to send the question</div>
                                    <div className="text-small">Hold to voice input</div>
                                </div>
                            } >
                                <Button type="button" aria-label="send"
                                    onPressStart={startPress} onPressEnd={endPress}
                                    className=" justify-center text-success items-center flex flex-col m-3 lg:w-2/12 sm:w-4/12 max-h-full" >
                                    {hold && <BiMicrophone className=" text-red-500 animate-ping" size={'2em'} />}
                                    {!hold && <BiMessageRoundedDetail size={'2em'} />}
                                </Button>
                            </Tooltip>
                        </div>

                    </CardBody>
                </Card>
            </Tab>
            <Tab title={<h2 className=' text-xl'>Configuration</h2>} >
                <Card>
                    <CardBody>
                        <div className="  min-h-unit-16 inline-flex  items-stretch justify-evenly">
                            <card>
                                <CardBody>
                                    <RadioGroup
                                        label="Select AI model"
                                        orientation="horizontal" defaultValue={'gpt-4-0613'}
                                    >
                                        <Radio value="gpt-4-0613">GPT-4</Radio>
                                        <Radio value="gpt-3.5-turbo-16k-0613">GPT-3.5-16K</Radio>
                                        <Radio value="gpt-3.5-turbo-0613">GPT-3.5</Radio>
                                        <Radio value="bard" isDisabled >Google Bard</Radio>
                                    </RadioGroup>
                                </CardBody>
                            </card>

                            <card>
                                <CardBody>
                                    <Input size="lg" defaultValue={0.5}
                                        type="number"
                                        label="Softmax Temperature"
                                        placeholder="The value must between 0 and 1"
                                        labelPlacement="outside"
                                        startContent={
                                            <BiSolidThermometer className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                                        }
                                    />
                                </CardBody>
                            </card>
                        </div>
                    </CardBody>
                </Card>
            </Tab>
        </Tabs>
    )
}