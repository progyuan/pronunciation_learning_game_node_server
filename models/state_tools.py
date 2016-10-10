import re

############

class States:
        #old=[]
        #new=[]
        #num_gauss_per_state;
        def __init__(self, _old, _new):
                self.old=_old
                self.new=_new


###########

def get_states_from_states_line_d(line_states):
        states=[]
        line_states=re.sub('\n','',line_states)                        
        list_of_states=line_states.split(' ')
        for state in list_of_states:
                
                states.append(int(state))
        return states

def get_states_from_states_line(line_states):
        states=[]
        line_states=re.sub('\-1\s*','',line_states)
        line_states=re.sub('\-2\s*','',line_states)
        line_states=re.sub('\n','',line_states)                     
        list_of_states=line_states.split(' ')

        #print list_of_states
        for state in list_of_states:
                states.append(int(state))
        #state.append(int(list_of_states[1]))
        return states

###########

def extract_states_from_hmm(hmm):
        line_states=hmm[1]
        state=get_states_from_states_line(line_states)
        #print "states line",line_states
        return state

#############



def collect_sorted_list_of_states(HMM):
        states=[];
        
        for hmm in HMM:
                temp=extract_states_from_hmm(hmm)
                for item in temp:
                        states.append(int(item))
        states_unsorted=states        
        states=list(set(states))
        states.sort(key=int)
        #print "list of states in sorting func", states, states_unsorted
        return states

############


def find_states_mapping(HMM):
        ordered_list_of_states=collect_sorted_list_of_states(HMM)        
        cnt_states=0
        states=[]
        #print "list of states in func", ordered_list_of_states
        for state in ordered_list_of_states:
                states.append(States(state,cnt_states))
                #print "dbg", states.old
                cnt_states=cnt_states+1
        return states

#################

def replace_states(HMM,mapping):
        HMM_out=[]
        for hmm in HMM:
                line_states=hmm[1]
                #print "replace_states", line_states
                states=get_states_from_states_line(line_states)
                #print(states)
                for one_state in mapping:
                        #print one_state.old
                        for state in states:
                                if int(state)==one_state.old:
                                        #print "kekkonen",state, one_state.old
                                        line_states=re.sub(str(state),str(one_state.new), line_states)
                                        #print line_states
                #print line_states
                hmm[1]=line_states

                HMM_out.append(hmm)        
        return HMM_out

