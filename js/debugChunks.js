var debugChunkLists = {};
{
    // <editor-fold desc="testLinear">
    var cl1 = [
        { text: 'Oh, there\'s someone here.' },
        { text: 'Hello there!' }
    ];
    cl1.type = 'speech';
    cl1.title = 'Player';
    
    var cl2 = [
        { text: 'Hmph' }
    ];
    cl2.type = 'speech';
    cl2.title = 'Grumpy stranger';
    
    var cl3 = [
        { text: 'Apparently, they don\'t want to talk' }
    ];
    cl3.type = 'message';
    
    debugChunkLists.testLinear = [
        cl1, cl2, cl3
    ];
    // </editor-fold>

    // <editor-fold desc="testQuestion">
    var cq1 = [{ text: 'Hello!' }];
    cq1.type = 'speech';
    cq1.title = 'Player';
    
    var cq2a_1 = [{ text: 'Who are you?' }];
    cq2a_1.type = 'speech';
    cq2a_1.title = 'Player';
    
    var cq2a_2 = [
        { text: 'My name is Tim, I\'m a wizard!' },
        { text: 'I was going to be an enchanter, but fire magic is more fun.' }
    ];
    cq2a_2.type = 'speech';
    cq2a_2.title = 'Tim the Wizard';
    
    var cq2b_1 = [{ text: 'What are you doing here?' }];
    cq2b_1.type = 'speech';
    cq2b_1.title = 'Player';
    
    var cq2b_2 = [{ text: 'I\'m here to help guard the caravan.' }];
    cq2b_2.type = 'speech';
    cq2b_2.title = 'Tim the Wizard';
    
    var cq2a = [cq2a_1, cq2a_2];
    cq2a.text = 'Who are you?';
    
    var cq2b = [cq2b_1, cq2b_2];
    cq2b.text = 'What are you doing here?';
    
    var cq2 = [ cq2a, cq2b ];
    cq2.type = 'choice';
    cq2.title = 'What would you like to say?';
    debugChunkLists.testQuestion = [cq1, cq2];
    // </editor-fold>

    // <editor-fold desc="testReferences (Not implemented)">
    // debugChunkLists.testReferences = []; // TODO
    // </editor-fold>

    //<editor-fold desc="testBranching (Old format)">
    /*debugChunkLists.testBranching = [
        {
            type: 'branch',
            options: [
                {
                    text: 'If you\'re wearing Avalani\'s robes',
                    chunks: [
                        {
                            type: 'speech',
                            title: 'Tim the Wizard',
                            items: [
                                { text: 'Wait, those robes look familiar, where did you get those?' }
                            ]
                        }
                    ]
                },
                {
                    text: 'Otherwise',
                    chunks: [
                        {
                            type: 'speech',
                            title: 'Tim the Wizard',
                            items: [
                                { text: 'Sorry, I don\'t have time to stop and chat.' }
                            ]
                        }
                    ]
                }
            ]
        }
    ];*/
    //</editor-fold>
}